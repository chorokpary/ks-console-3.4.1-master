/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
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

import styles from './index.scss'

export default class RuleList extends React.Component {
  render() {
    const { templates, memberRole } = this.props

    return (
      <ul className={styles.wrapper} data-test="rule-list">
        {Object.keys(templates).map(key => (
          <li key={key}>
            <div className={styles.name}>
              {t(`PERMIGROUP_${key.toUpperCase().replace(/[^A-Z]+/g, '_')}`)}
            </div>
            <div>
              {templates[key]
                .map(role =>
                  t(
                    `PERMISSION_${role.aliasName
                      .toUpperCase()
                      .replace(/[^A-Z]+/g, '_')}`
                  )
                )
                .join('  |  ')}
            </div>
          </li>
        ))}
        <li key={Object.keys(templates).length+1}>
            <div className={styles.name}>{t('RESOURCES_WORKLOAD')}</div>
            <div> 
                  {t('RESOURCES_WORKLOAD_VIEW')} 
                  {memberRole != "viewer" && `  |   ${t('RESOURCES_WORKLOAD_MANAGE')}`}
            </div>
        </li>
        <li key={Object.keys(templates).length+2}>
            <div className={styles.name}>{t('RESOURCES_SETTINGS')}</div>
            <div> 
                  {t('RESOURCES_SETTINGS_VIEW')} 
                  {memberRole != "viewer" && `  |   ${t('RESOURCES_SETTINGS_MANAGE')}`}
            </div>
        </li>
        <li key={Object.keys(templates).length+3}>
            <div className={styles.name}>{t('RESOURCES_RESOURCE_TEMPLATE')}</div>
            <div> 
                  {t('RESOURCES_RESOURCE_TEMPLATE_VIEW')} 
                  {memberRole != "viewer" && `  |   ${t('RESOURCES_RESOURCE_TEMPLATE_MANAGE')}`}
            </div>
        </li>      
      </ul>
    )
  }
}
