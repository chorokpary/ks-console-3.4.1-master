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

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isUndefined } from 'lodash';
import { Icon } from '@kube-design/components';

import { ICON_TYPES } from 'utils/constants';
import styles from './index.scss';

export default class EmptyTable extends React.PureComponent {
  static propTypes = {
    module: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    desc: PropTypes.string,
    className: PropTypes.string,
    action: PropTypes.node,
  };

  static defaultProps = {
    name: '',
    module: '',
  };

  render() {
    const { module, icon, title, name, desc, action, className } = this.props;
    console.log('module', module);
    console.log('title', title);
    console.log('name', name);
    console.log('action', action);
    console.log('className', className);

    const _desc = !isUndefined(desc)
      ? desc
      : t.html(`${name.replace(/[-\s]/g, '_').toUpperCase()}_EMPTY_DESC`);

    let _icon = icon || ICON_TYPES[module];
    // || 'appcenter';
    // if (name === '가상머신') {
    //   _icon = 'ico-type-vm';
    //   // <i class="ico-type-vm"></i>
    // }
    if (name === 'KaaS 리소스') {
      _icon = 'kubernetes';
    }
    //컴퓨팅 설정
    if (name === '네트워크') {
      _icon = 'network-duotone';
    }
    if (name === '보안그룹') {
      _icon = 'shield';
    }
    if (name === '가상 라우터') {
      _icon = 'router';
    }
    if (name === '플로팅 IP') {
      _icon = 'intranet-routers';
    }
    if (name === '로드 밸런서') {
      _icon = 'loadbalancer';
    }
    if (name === '볼륨') {
      _icon = 'storage';
    }
    // if (name === '호스트 디바이스') {
    //   _icon = 'storage';
    //   // <i class="ico-type-hostdevice"></i>
    // }
    // if (name === 'Mediated 디바이스') {
    //   _icon = 'storage';
    //   // <i class="ico-type-mediatedvgpu"></i>
    // }
    if (name === '애플리케이션 배포 관리') {
      _icon = 'application';
    }
    //컴퓨팅 리소스 템플릿
    if (name === 'Flavor') {
      _icon = 'apps';
    }
    if (name === '키페어') {
      _icon = 'key';
    }
    if (name === '가상머신 이미지') {
      _icon = 'snapshot';
    }
    if (name === 'KaaS 이미지') {
      _icon = 'snapshot';
    }
    if (name === '가상머신 이미지 빌드') {
      _icon = 'image';
    }
    console.log('icon[module]', icon);
    console.log('ICON_TYPES[module]', ICON_TYPES[module]);

    return (
      <div className={classnames(styles.wrapper, className)}>
        <div className={styles.image}>
          {_icon !== undefined && <Icon name={_icon} size={48} />}
          {_icon === undefined && name === '가상머신' && (
            <i
              class="ico-type40-vm"
              size={48}
              style={{ position: 'relative', left: '6px', top: '3px' }}
            />
          )}
          {_icon === undefined && name === '호스트 디바이스' && (
            <i
              class="ico-type40-hostdevice"
              size={48}
              style={{ position: 'relative', left: '6px', top: '3px' }}
            />
          )}
          {_icon === undefined && name === 'Mediated 디바이스' && (
            <i
              class="ico-type40-mediatedvgpu"
              size={48}
              style={{ position: 'relative', left: '6px', top: '3px' }}
            />
          )}
        </div>
        <div className={styles.title}>
          {title ||
            t('EMPTY_WRAPPER', {
              resource: t(name.replace(/[- ]/g, '_').toUpperCase()),
            })}
        </div>
        <p className={styles.desc}>{_desc}</p>
        {action && <div className={styles.actions}>{action}</div>}
      </div>
    );
  }
}
