import { getNodeStatus } from 'utils/node'

export const fnSetClusterNodes = (list, data) => {
    list.map((obj) => {
        const status = getNodeStatus(obj)
        if (obj.role.indexOf('master') === 0 || obj.role.indexOf('control-plane') === 0) {
            if (status !== 'Unschedulable') {
                data.master.on += 1
            }
            data.master.total += 1
        } else {
            if (status !== 'Unschedulable') {
                data.worker.on += 1
            }
            data.worker.total += 1
        }

        if (status === 'Running') {
            data.running += 1
        } else if (status === 'Warning') {
            data.warning += 1
        } else if (status === 'Unschedulable') {
            data.unschedulable += 1
        }
    })
    data.total = list.length
    return data;
}

export const fnSetPods = (list, data) => {
    list.map((obj) => {
        if (obj.podStatus.type === 'waiting') {
            data.waiting += 1
        } else if (obj.podStatus.type === 'running') {
            data.running += 1
        } else if (obj.podStatus.type === 'completed') {
            data.completed += 1
        } else if (obj.podStatus.type === 'error') {
            data.error += 1
        }
    })
    data.total = list.length
    return data;
}

export const fnSetK8s = (list, data) => {
    list.map((obj) => {
        if (!obj.cluster_ready) {
            data.notReady += 1
        } else if (obj.cluster_ready) {
            data.ready += 1
        }
    })
    data.total = list.length
    return data;
}