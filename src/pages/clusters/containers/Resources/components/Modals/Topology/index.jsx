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

import { isUndefined, isEmpty } from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { Modal } from 'components/Base'
import EditMode from 'components/EditMode'

import TopologyItem from './Item'

import styles from './index.scss'

export default class TopologyModal extends React.Component {
  static propTypes = {
    detail: PropTypes.object,
    vmlog: PropTypes.object,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    readOnly: PropTypes.bool,
  }

  static defaultProps = {
    visible: false,
    readOnly: false,
    detail: {},
    onOk() {},
    onCancel() {},
  }

  constructor(props) {
    super(props)

    this.state = {
      value: props.store ? null : props.detail,
    }

    this.editor = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && !prevProps.visible) {
      this.init(this.props)
    }
  }

  componentDidMount() {
    this.init(this.props)
  }

  init(props) {
    const { vmlog, detail, store } = props
    if (vmlog) {
      return this.setState({ value: vmlog })
    }
  }

  render() {
    const { readOnly, visible, onCancel } = this.props
    const title = t('전체 네트워크 토폴리지')

    return (
      <Modal
        title={title}
        bodyClassName={classnames({
          [styles.readOnly]: true,
        })}
        onCancel={onCancel}
        visible={visible}
        closable={true}
        hideFooter={true}
        fullScreen
      >
          <TopologyItem/>
      </Modal>
    )
  }
}
