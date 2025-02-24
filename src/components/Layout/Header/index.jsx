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
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { Button, Icon, Menu, Dropdown } from '@kube-design/components'
import { isAppsPage, getCustomizedWebsiteUrl } from 'utils'
import LicenseStore from 'stores/resources/licenses'

import LoginInfo from '../LoginInfo'

import styles from './index.scss'

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.licenseStore = new LicenseStore();
    this.state = {
      licenseStatus: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    this.fetchValidation();
  }

  static propTypes = {
    className: PropTypes.string,
    innerRef: PropTypes.object,
    jumpTo: PropTypes.func,
  }

  get isLoggedIn() {
    return Boolean(globals.user)
  }

  async fetchValidation() {
    try {
      const result = await this.licenseStore.defaultValidation();
      this.setState({ licenseStatus: result, isLoading: false });
    } catch (error) {
      console.error('License validation result fetching failed:', error);
      this.setState({ isLoading: false });
    }
  }

  handleLinkClick = link => () => {
    this.props.jumpTo(link)
  }

  handleDocumentLinkClick = (e, key) => {
    window.open(key)
  }

  renderDocumentList() {
    const { url, api } = getCustomizedWebsiteUrl()
    return (
      <Menu onClick={this.handleDocumentLinkClick} data-test="header-docs">
        <Menu.MenuItem key={url}>
          <Icon name="hammer" /> {t('USER_GUIDE')}
        </Menu.MenuItem>
        <Menu.MenuItem key={api}>
          <Icon name="api" /> {t('API_DOCUMENT')}
        </Menu.MenuItem>
      </Menu>
    )
  }

  render() {
    const { className, innerRef, location } = this.props
    const logo = globals.config.logo || '/assets/logo.svg'
    const { licenseStatus } = this.state;

    return (
      <div>
        {licenseStatus && licenseStatus.validate_result === false && 
          this.state.isLoading === false && (
          <div className="header-license">
            {t(`RESOURCES_MMS_ERROR_DESC_${licenseStatus.validate_code}`)}
          </div>
        )}
        <div
          ref={innerRef}
          className={classnames(
            styles.header,
            {
              [styles.inAppsPage]: isAppsPage(),
              [styles.hasNotification]: licenseStatus && licenseStatus.validate_result === false && this.state.isLoading === false,
            },
            className
          )}
        >
          <Link to={isAppsPage() && !globals.user ? '/apps' : '/'}>
            <img
              className={styles.logo}
              src={isAppsPage() ? `/assets/logo.svg` : logo}
              alt=""
            />
          </Link>
          <div className="header-bottom" />
          {this.isLoggedIn && (
            <div className={styles.navs}>
              {globals.app.enableGlobalNav && (
                <Button
                  type="flat"
                  icon="cogwheel"
                  onClick={this.props.onToggleNav}
                >
                  {t('PLATFORM')}
                </Button>
              )}
              {globals.app.enableAppStore && (
                <Button
                  type="flat"
                  icon="appcenter"
                  onClick={this.handleLinkClick('/apps')}
                  className={classnames({
                    [styles.active]: location.pathname === '/apps',
                  })}
                >
                  {t('APP_STORE')}
                </Button>
              )}
              <Button
                type="flat"
                icon="dashboard"
                onClick={this.handleLinkClick('/')}
                className={classnames({
                  [styles.active]: location.pathname === '/',
                })}
              >
                {t('WORKBENCH')}
              </Button>
            </div>
          )}
          <div className={styles.right}>
            {this.isLoggedIn && (
              <Dropdown content={this.renderDocumentList()}>
                <Button type="flat" icon="documentation" />
              </Dropdown>
            )}
            <LoginInfo className={styles.loginInfo} isAppsPage={isAppsPage()} />
          </div>
        </div>
      </div>
    )
  }
}

export default Header
