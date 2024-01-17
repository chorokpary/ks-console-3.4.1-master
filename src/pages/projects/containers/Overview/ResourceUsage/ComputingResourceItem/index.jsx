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
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { isFunction } from 'lodash'

import { Icon, Tooltip } from '@kube-design/components'

import styles from './index.scss'

@inject('rootStore')
@observer
export default class ResourceCard extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    iconSize: PropTypes.number,
    name: PropTypes.string,
    namespace: PropTypes.string,
    routeName: PropTypes.string,
    num: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    warnNum: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    icon: 'appcenter',
    iconSize: 40,
    name: 'deployment',
    namespace: 'default',
    routeName: '',
    num: 0,
    warnNum: 0,
  }

  get routing() {
    return this.props.rootStore.routing
  }

  handleClick = () => {
    const {
      onClick,
      name,
      routeName,
      workspace,
      namespace,
      cluster,
    } = this.props
    if (isFunction(onClick)) {
      onClick(name)
    } else if (routeName) {
      this.routing.push(
        workspace
          ? `/${workspace}/clusters/${cluster}/projects/${namespace}/${routeName}`
          : `/clusters/${cluster}/${routeName}?namespace=${namespace}`
      )
    }
  }


  render() {
    const {
      className,
      icon,
      iconSize,
      name,
      routeName,
      num,
      onClick,
    } = this.props

    return (
      <div data-name={name} className={classnames(styles.card, className)}>
        <div className={styles.icon}>
          {
            icon.includes('ico-') ? <i className={icon}></i> : <Icon name={icon} size={30} />
          }
        </div>
        <div
          className={classnames(styles.info, {
            [styles.cursor]: routeName || onClick,
          })}
          onClick={this.handleClick}
        >
          <strong>{num}</strong>
          <span>{num === '1' ? t(name) : t(`${name}`)}</span>
        </div>
      </div>
    )
  }
}
