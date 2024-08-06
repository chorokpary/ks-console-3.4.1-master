/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'

import { Icon, Tooltip } from '@kube-design/components'
import { Text } from 'components/Base'

import styles from './index.scss'

const StatusCard = ({ data }) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Icon name={data.icon} size={40} />
        {data.flag.status ? (
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
        title={t(`RESOURCES_CLUSTER_SCHEDULE_${data.name.toUpperCase()}`)}
        description={t(
          `RESOURCES_CLUSTER_SCHEDULE_${data.name.toUpperCase()}_DESC`
        )}
      />
    </div>
  )
}

export default StatusCard
