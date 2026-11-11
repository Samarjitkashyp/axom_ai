"""
Shared helpers for hierarchical (multilevel) HeaderNavItem and HeaderMegaMenuItem
serialization, cycle prevention, and atomic drag-and-drop tree reordering.
"""
from django.db import transaction


def serialize_nav_item(item):
    """Return base dictionary for a HeaderNavItem instance."""
    return {
        'id': item.id,
        'parent_id': item.parent_id,
        'title': item.title,
        'url': item.url or '',
        'order': item.order,
        'is_active': item.is_active,
    }


def serialize_mega_item(item):
    """Return base dictionary for a HeaderMegaMenuItem instance."""
    return {
        'id': item.id,
        'parent_id': item.parent_id,
        'title': item.title,
        'description': item.description or '',
        'icon_class': item.icon_class or 'fa-solid fa-brain',
        'color_class': item.color_class or 'text-fuchsia-400',
        'url': item.url or '',
        'order': item.order,
        'is_active': item.is_active,
    }


def build_menu_tree(model_cls, serializer_fn, active_only=False, include_is_active=False):
    """
    Build a sorted recursive tree list for `model_cls` in a single query.
    Orphans (whose parent is missing or inactive when `active_only=True`) are skipped
    when `active_only=True` so hiding a parent hides its subtree cleanly.
    """
    qs = model_cls.objects.all().order_by('order', 'id')
    if active_only:
        qs = qs.filter(is_active=True)

    rows = list(qs)
    nodes_by_id = {}
    children_map = {}

    for row in rows:
        node = serializer_fn(row)
        if not include_is_active:
            node.pop('is_active', None)
        node['children'] = []
        nodes_by_id[row.id] = node
        children_map.setdefault(row.parent_id, []).append(node)

    def attach(parent_id, depth, ancestry):
        branch = []
        for child in children_map.get(parent_id, []):
            cid = child['id']
            if cid in ancestry:
                continue
            child_copy = dict(child)
            if not active_only:
                child_copy['depth'] = depth
            child_copy['children'] = attach(cid, depth + 1, ancestry | {cid})
            branch.append(child_copy)
        return branch

    return attach(None, 0, set())


def flatten_tree_options(tree, depth=0):
    """Return flat list with `indent_label` for <select> Parent Item dropdowns."""
    result = []
    prefix = ('— ' * depth) if depth > 0 else ''
    for node in tree:
        result.append({
            'id': node['id'],
            'title': node['title'],
            'depth': depth,
            'indent_label': f"{prefix}{node['title']}",
        })
        if node.get('children'):
            result.extend(flatten_tree_options(node['children'], depth + 1))
    return result


def would_create_cycle(model_cls, item_id, candidate_parent_id):
    """Return True if assigning `candidate_parent_id` as parent of `item_id` creates a cycle."""
    if not item_id or not candidate_parent_id:
        return False
    if int(item_id) == int(candidate_parent_id):
        return True

    parent_lookup = dict(model_cls.objects.values_list('id', 'parent_id'))
    seen = {int(item_id)}
    cursor = int(candidate_parent_id)
    while cursor is not None:
        if cursor in seen:
            return True
        seen.add(cursor)
        cursor = parent_lookup.get(cursor)
    return False


def apply_menu_reorder(model_cls, items_payload):
    """
    Persist flattened tree order and parent links inside one atomic transaction.
    `items_payload`: list of dicts with `{ "id": int, "parent_id": int|None, "order": int }`.
    """
    if not isinstance(items_payload, list):
        raise ValueError("Expected 'items' to be a list.")

    existing = {obj.id: obj for obj in model_cls.objects.all()}
    pending_parents = dict((obj.id, obj.parent_id) for obj in existing.values())

    normalized = []
    for idx, entry in enumerate(items_payload):
        if not isinstance(entry, dict) or entry.get('id') in (None, ''):
            continue
        item_id = int(entry['id'])
        if item_id not in existing:
            raise ValueError(f"Menu item id={item_id} does not exist.")

        raw_parent = entry.get('parent_id')
        parent_id = int(raw_parent) if raw_parent not in (None, '', 'null', 'root') else None
        if parent_id is not None and parent_id not in existing:
            raise ValueError(f"Parent item id={parent_id} does not exist.")

        order = int(entry.get('order', idx))
        pending_parents[item_id] = parent_id
        normalized.append((item_id, parent_id, order))

    # Verify zero cycles across the new full parent graph
    for node_id in pending_parents:
        seen = set()
        cursor = node_id
        while cursor is not None:
            if cursor in seen:
                raise ValueError("Invalid hierarchy: circular parent relationship detected.")
            seen.add(cursor)
            cursor = pending_parents.get(cursor)

    with transaction.atomic():
        to_update = []
        for item_id, parent_id, order in normalized:
            obj = existing[item_id]
            if obj.parent_id != parent_id or obj.order != order:
                obj.parent_id = parent_id
                obj.order = order
                to_update.append(obj)
        if to_update:
            model_cls.objects.bulk_update(to_update, ['parent', 'order'])
    return len(normalized)

