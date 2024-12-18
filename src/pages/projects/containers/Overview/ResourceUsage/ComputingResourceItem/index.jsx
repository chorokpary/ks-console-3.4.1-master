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


import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { isFunction } from 'lodash'

import { Icon, Tooltip } from '@kube-design/components'

import styles from './index.scss'

import moment from 'moment-mini'
import TinyArea from '../TinyArea'

const ResourceCard = (props) => {

  const routing = props.rootStore.routing;

  const [loading, setLoading] = useState(true);

  const resourceType = props.routeName;
  const resourceData = props.dataList; 
  const resourceCreateField = props.createField;

  const graphExceptionArray = ['floatingIp','hostDevices','mediatedDevices']

  const [vmData, setVmData] = useState({});
  const [imageData, setImageData] = useState({});
  const [volumeData, setVolumeData] = useState({});
  const [flavorData, setFlavorData] = useState({});
  const [keypairData, setKeypairData] = useState({});
  const [networkData, setNetworkData] = useState({});
  const [sriovData, setSriovData] = useState({});
  const [routerData, setRouterData] = useState({});
  const [floatingData, setFloatingData] = useState({});
  const [loadBalancerData, setLoadBalancerData] = useState({});
  const [securityGroupData, setSecurityGroupData] = useState({});
  const [hostDeviceData, setHostDeviceData] = useState({});
  const [mediatedDevicesData, setMediatedDevicesData] = useState({});

  const stateVariables = {
    vms: vmData,        
    images: imageData,         
    resourcesVolumes: volumeData,   
    flavors: flavorData,
    keypairs: keypairData,   
    networks: networkData,       
    sriovs: sriovData,             
    routers: routerData,
    floatingip: floatingData, 
    loadBalancers: loadBalancerData,  
    securityGroups: securityGroupData,     
    hostDevices: hostDeviceData,
    mediatedDevices: mediatedDevicesData,
  };

  const setVariables = {
    vms: setVmData,        
    images: setImageData,         
    resourcesVolumes: setVolumeData,   
    flavors: setFlavorData,
    keypairs: setKeypairData,   
    networks: setNetworkData,       
    sriovs: setSriovData,             
    routers: setRouterData,
    floatingip: setFloatingData, 
    loadBalancers: setLoadBalancerData,  
    securityGroups: setSecurityGroupData,     
    hostDevices: setHostDeviceData,
    mediatedDevices: setMediatedDevicesData,
  };

  useEffect(() => {

    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)

      if (cleanupTrigger) {

        const dataList = props.multitenancy ? resourceData.filter(item => item.project == props.namespace) : resourceData;

        handleDate(dataList, resourceCreateField, resourceType)
        setLoading(false)
      }
    };
    getData();
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }

  }, [])

  // recent week
  const handleDate = (list, dateType, resourceType) => {

    let sortData = "";
    if(dateType != "not"){
       sortData = list.sort((a, b) => {
        var x = a[dateType];
        var y = b[dateType];

        // return x < y ? -1 : x > y ? 1 : 0;  // asc
        return x > y ? -1 : x < y ? 1 : 0; // desc
          
      });
    }else{
      sortData = list;
    }

    let date = new Date();
    let unixTime = date.getTime();

    let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let arrIdx = arr.length - 1;
    let cnt = sortData.length;
    let idx = 0;
    while (arrIdx >= 0 && idx < sortData.length) {

      if (unixTime > new Date(sortData[idx][dateType])) {
        arr[arrIdx] = cnt;
        unixTime -= 86400000; // the day before
        arrIdx--;
      } else {
        idx++;
        cnt--;
      }
    }

    let arrList = [];
    unixTime = date.getTime();
    arr.map((el, idx) => {
      arrList.unshift({
        time: moment(unixTime).format('MM-DD HH:mm'),
        'Run': arr[arr.length - 1 - idx]
      })
      unixTime -= 86400000;
    })


    if (typeof setVariables[resourceType] === 'function') {
      setVariables[resourceType]({ data: arrList });
    }

  }

  const handleClick = () => {
    const {
      onClick,
      name,
      routeName,
      workspace,
      namespace,
      cluster,
    } = props
    if (isFunction(onClick)) {
      onClick(name)
    } else if (routeName) {
      routing.push(
        workspace
          ? `/${workspace}/clusters/${cluster}/projects/${namespace}/${routeName}`
          : `/clusters/${cluster}/${routeName}?namespace=${namespace}`
      )
    }
  }

  const {
    className,
    icon,
    iconSize,
    name,
    routeName,
    num,
    onClick,
  } = props


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
        onClick={handleClick}
      >
        <strong>{num}</strong>
        <span>{num === '1' ? t(name) : t(`${name}`)}</span>
      </div>
      {graphExceptionArray.includes(resourceType) == false &&
        <TinyArea width={330} height={44} bgColor="transparent" {...stateVariables[resourceType]} />
      }
    </div>
  );
};

export default inject('rootStore')(observer(ResourceCard))