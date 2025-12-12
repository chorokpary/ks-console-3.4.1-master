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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get, set } from 'lodash'

import { Form } from '@kube-design/components'
import { getDocsUrl } from 'utils'
import { PATTERN_IMAGE, PATTERN_IMAGE_TAG } from 'utils/constants'
import ContainerStore from 'stores/container'
import DropdownContent from './DropdownContent'

export default class ImageSearch extends Component {
  constructor(props) {
    super(props)
    this.store = new ContainerStore()

    this.state = {
      isLoading: false,
      selectedLoading: false,
      selectedImage: undefined,
      selectedImageTag: undefined,
    }
  }

  static defaultProps = {
    className: '',
    type: 'add',
  }

  static contextTypes = {
    forceUpdate: PropTypes.func,
    setImageDetail: PropTypes.func,
  }

  get secret() {
    const { imageRegistries, formTemplate } = this.props
    const defaultsecrect = imageRegistries.find(item => item.isDefault)

    return get(formTemplate, 'pullSecret', defaultsecrect?.value || '')
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.namespace !== this.props.namespace) {
      set(this.props.formTemplate, 'image', '')

      this.setState({
        selectedImage: undefined,
        selectedImageTag: '',
        isLoading: false,
      })
    }
  }

  componentWillUnmount() {
    this.isUnMounted = true
  }

  renderWaringText = () => {
    return <p>{t('IGNORE_CERT_WARN_DESC')}</p>
  }

  render() {
    return (
      <>
        <Form.Item
          label={t('IMAGE')}
          desc={t.html('IMAGE_DESC', {
            link: getDocsUrl('imageregistry'),
          })}
          // rules={[
          //   { required: true, message: t('IMAGE_EMPTY') },
          //   { pattern: PATTERN_IMAGE, message: t('INVALID_IMAGE') },
          // ]}
        >
          <DropdownContent
            {...this.props}
            store={this.store}
            name="image"
            onLoading={this.handleLoadingChange}
          />
        </Form.Item>
      </>
    )
  }
}
