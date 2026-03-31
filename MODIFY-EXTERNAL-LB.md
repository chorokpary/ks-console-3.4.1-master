# Modify External LB — REST API Contract

When a user edits an External LoadBalancer and clicks OK, the frontend sends a **single PUT request**. The backend replaces the entire LB state (members + rules) with the submitted data.

## PUT — Update LB

```
PUT /kapis/edgestack.kubesphere.io/v1alpha1
      /klusters/{cluster}/namespaces/{namespace}
      /lbs/{name}/estk
      /edgetron/resources/kubevirt/lbs/{name}
```

### Request Body

```json
{
  "lb": {
    "name": "my-lb",
    "network": "elb",
    "project": "default",
    "description": "updated description",
    "members": ["foo", "bar"],
    "lb_rule": [
      {
        "ruleType": "CUSTOM",
        "protocol": "TCP",
        "port": "80",
        "target_port": "8080"
      },
      {
        "ruleType": "HTTPS",
        "protocol": "TCP",
        "port": "443",
        "target_port": "443"
      }
    ]
  }
}
```

### Field Descriptions

| Field | Type | Description |
|---|---|---|
| `name` | string | LB name (immutable) |
| `network` | string | ELB network name |
| `project` | string | K8s namespace |
| `description` | string | User description (may be empty string) |
| `members` | string[] | List of target VM names |
| `lb_rule` | object[] | **Full list of rules** — replaces all existing rules |
| `lb_rule[].ruleType` | string | One of: `CUSTOM`, `HTTP`, `HTTPS`, `DNS`, `SSH` |
| `lb_rule[].protocol` | string | `TCP` or `UDP` |
| `lb_rule[].port` | string | External port (single integer, 1–65535) |
| `lb_rule[].target_port` | string | Target port (single integer, 1–65535) |

### Backend Behavior

The backend should treat `lb_rule` as the **desired final state**:
- Rules in the array → create or keep
- Rules not in the array → delete
- No individual rule CRUD endpoints required

### Expected Response

```json
{ "message": "OK" }
```

---

## Create uses the same pattern

```
POST /kapis/edgestack.kubesphere.io/v1alpha1
       /klusters/{cluster}/namespaces/{namespace}
       /lbs/{name}/estk
       /edgetron/resources/kubevirt/lbs
```

Same body format. Rules are included inline — no separate rule creation step.

---

## Removed from previous implementation

| Removed | Reason |
|---|---|
| `POST /lb_rules` | Rules are now inline in PUT/POST body |
| `DELETE /lb_rules/{id}/{project}` | Backend handles deletion via desired-state PUT |
| `originRule` field | No longer needed — no individual rule tracking |
| `originRuleId` field | Same reason |
| `setAll` flag | `ALL` rule type removed |
| `port_range_min` / `port_range_max` | Replaced by `port` / `targetPort` |
