import React from 'react'

import { Icon, Tooltip } from '@kube-design/components'
import { Text } from 'components/Base'

import styles from './index.scss'

const StatusCard = ({ data }) => {
    return (
        <div className={styles.card}>
            <div className={styles.icon}>
                <Icon name={data.icon} size={40} />
                {data ? (
                    <Tooltip maxWidth="400" placement="bottom-start">
                        <Icon
                            className={styles.check}
                            name="check"
                            type="light"
                            size={12}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip content={data.flag.message}>
                        <Icon
                            className={styles.substract}
                            name="substract"
                            type="light"
                            size={12}
                        />
                    </Tooltip>
                )}
            </div>
            <Text
                title={t(`RESOURCES_LICENSE_STATUS_${data.name.toUpperCase()}`)}
                description={t(`RESOURCES_LICENSE_STATUS_${data.name.toUpperCase()}_DESC`)}
            />
        </div>
    )
}

export default StatusCard