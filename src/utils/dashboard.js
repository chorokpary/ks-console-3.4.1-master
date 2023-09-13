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

export const fnSetVms = (list, data) => {
    list.map((obj) => {
        if (obj.state === 'Provisioning'
            || obj.state === 'Starting'
            || obj.state === 'Stopping'
            || obj.state === 'Terminating'
            || obj.state === 'Migrating') {
            data.waiting += 1
        } else if (obj.state === 'Running') {
            data.running += 1
        } else if (obj.state === 'Stopped' || obj.state === 'Paused') {
            data.stopped += 1
        } else if (obj.state === 'Unknown') {
            data.error += 1
        }
    })
    data.total = list.length
    return data;
}
export const fnSetK8s = (list, data) => {
    list.map((obj) => {
        if (obj.state === 'Provisioning'
            || obj.state === 'Deleting') {
            data.notReady += 1
        } else if (obj.state === 'Provisioned') {
            data.ready += 1
        }
    })
    data.total = list.length
    return data;
}