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
import PropTypes from 'prop-types'

import { trimEnd } from 'lodash'

import NavItem from './NavItem'

import styles from './index.scss'

class Nav extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    navs: PropTypes.array.isRequired,
    prefix: PropTypes.string,
    checkSelect: PropTypes.func,
    onItemClick: PropTypes.func,
    innerRef: PropTypes.object,
  }

  static defaultProps = {
    className: '',
    prefix: '',
    checkSelect() {},
    onItemClick() {},
  }

  constructor(props) {
    super(props)

    this.state = {
      openedNav: this.getOpenedNav(),
      exceptionMenu: [],
    }
  }

  async componentDidMount() {
    try {
      const configMapList = await request.get(
        '/api/v1/namespaces/default/configmaps'
      )

      const exists = configMapList?.items?.some(
        item => item?.metadata?.name === 'exception-menu-config'
      )

      let exceptionMenuData = []

      if (!exists) {
        const result = await this.createMenuConfig()
        exceptionMenuData = result?.data?.exceptionmenu || []
      } else {
        const configMap = configMapList.items.find(
          item => item.metadata.name === 'exception-menu-config'
        )
        exceptionMenuData = JSON.parse(
          configMap?.data?.exceptionmenu || '[]'
        )
      }

      this.setState({ exceptionMenu: exceptionMenuData })
    } catch (e) {
      console.error('exception menu load failed', e)
    }
  }

  createMenuConfig = async () => {
    const data = {
          "apiVersion":"v1",
          "kind":"ConfigMap",
          "metadata":{
            "namespace":"default",
            "labels":{
            },
            "name":"exception-menu-config",
            "annotations":{
                "kubesphere.io/creator":"admin"
            }
          },
          "spec":{
            "template":{
              "metadata":{
                "labels":{
                },
                "annotations":{
                  "kubesphere.io/creator":"admin"
                }
              }
            }
          },
          "data":{  
            "clustermenu" : JSON.stringify( {
                "overview": "대시보드",
                "cluster-settings": "클러스터 설정",
                "projects": "프로젝트",
                "app-workloads": "애플리케이션 워크로드",
                "computing-workloads": "컴퓨팅 워크로드",
                "computing": "컴퓨팅 설정",
                "resources": "컴퓨팅 템플릿",
                "config": "환경설정",
                "network": "네트워크",
                "storage": "스토리지",
                "monitoring-alerting": "모니터링 및 알림"
              }, null, 2),
            "exceptionmenu": JSON.stringify([
                'app-workloads',
                'config',
                'network',
                'storage',
              ], null, 2)
            }
          }

    const result = await request.post(`/api/v1/namespaces/default/configmaps`,  data)
    return result
  }

  get currentPath() {
    const {
      location: { pathname },
      match: { url },
    } = this.props

    const length = trimEnd(url, '/').length
    return pathname.slice(length + 1)
  }

  getOpenedNav() {
    let name = ''
    const { navs } = this.props
    const current = this.currentPath
    navs.forEach(nav => {
      nav.items.forEach(item => {
        if (
          item.children &&
          item.children.some(child => {
            if (child.name === current) {
              return true
            }
            if (child.tabs) {
              return child.tabs.some(tab => tab.name === current)
            }

            return false
          })
        ) {
          name = item.name
        }
      })
    })

    return name
  }

  handleItemOpen = name => {
    this.setState(({ openedNav }) => ({
      openedNav: openedNav === name ? '' : name,
    }))
  }

  render() {
    const {
      className,
      navs,
      match,
      innerRef,
      onItemClick,
      disabled,
    } = this.props

    const { openedNav, exceptionMenu } = this.state
    const current = this.currentPath
    const prefix = trimEnd(match.url, '/')
    console.log("exceptionMenu : "+ JSON.stringify(exceptionMenu))
    return (
      <div ref={innerRef} className={className}>
        {navs.map(nav => (
          <div key={nav.cate} className={styles.subNav}>
            {nav.title && <p>{t(nav.title)}</p>}
            <ul>
              {nav.items.map(item => (
                <NavItem
                  key={item.name}
                  item={item}
                  prefix={prefix}
                  current={current}
                  onClick={onItemClick}
                  isOpen={item.name === openedNav}
                  onOpen={this.handleItemOpen}
                  disabled={disabled}
                  exceptionMenu={exceptionMenu}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
}

export default Nav
