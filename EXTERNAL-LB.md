# External Load Balancer — Frontend/Backend Contract Changes

This document describes the frontend changes made to the LoadBalancer Regist/Modify modals and the corresponding backend API changes required.

## 1. Single-Request Model (No Separate Rule Endpoints)

Rules are now sent **inline** with the LB create/update request. The backend should handle rule CRUD internally by treating `lb_rule` as the desired final state.

- **Create:** `POST /edgetron/resources/kubevirt/lbs` — body includes `lb_rule[]`
- **Update:** `PUT /edgetron/resources/kubevirt/lbs/{name}` — body includes `lb_rule[]`
- **`/edgetron/resources/kubevirt/lb_rules` endpoints are no longer used** by the frontend

See [MODIFY-EXTERNAL-LB.md](MODIFY-EXTERNAL-LB.md) for full request/response details.

## 2. Rule Port Fields Renamed

The frontend no longer sends `portRangeMin` / `portRangeMax` or `port_range_min` / `port_range_max`. Instead it sends two explicit fields per rule:

| Old Field | New Field | Description |
|---|---|---|
| `port_range_min` / `portRangeMin` | _(removed)_ | — |
| `port_range_max` / `portRangeMax` | _(removed)_ | — |
| — | `port` | External port (`spec.ports[].port`) |
| — | `targetPort` | Target port (`spec.ports[].targetPort`) |

Both values are single integers (1–65535). Port ranges are no longer accepted.

### Example `lb_rule` array

```json
[
  { "ruleType": "CUSTOM", "protocol": "TCP", "port": "80", "targetPort": "8080" },
  { "ruleType": "HTTPS", "protocol": "TCP", "port": "443", "targetPort": "443" }
]
```

## 3. Modify Modal Expects `port` / `targetPort` in GET Response

When the Modify modal loads existing rules from the LB detail API, it reads:

```js
obj.port       // → ExternalPort
obj.targetPort // → TargetPort
obj.protocol   // → "TCP" or "UDP"
```

The backend GET response for LB detail must return rules with these field names.

## 4. Network Filtering: `elb` Flag

The frontend now filters networks by `elb: true` (previously `external: false`).

- Only networks with `"elb": true` appear in the network dropdown.
- The `external` field is no longer used for filtering.

## 5. Supported Protocols: TCP and UDP Only

The frontend only offers TCP and UDP as protocol options.

The following are **no longer supported**:
- `ICMP`
- `ALL` (the "allow all" rule type has been removed)

## 6. VM List: No Network-Based Filtering

Previously, the VM dropdown only showed VMs connected to the selected network. Now it shows **all VMs in the project** (filtered by `project` field matching the k8s namespace).

The VM list API (`/edgetron/resources/kubevirt/vms`) response format is unchanged. The first available IP from `vm.networks[0].ip` is used as the member IP.

## 7. Summary of Removed Fields / Flags

| Removed | Reason |
|---|---|
| `port_range_min` / `portRangeMin` | Replaced by `port` |
| `port_range_max` / `portRangeMax` | Replaced by `targetPort` |
| `originRule` | No individual rule tracking |
| `originRuleId` | No individual rule tracking |
| `setAll` | `ALL` rule type removed |
| `protocol: "ALL"` | Only TCP/UDP supported |
| `protocol: "ICMP"` | Only TCP/UDP supported |
