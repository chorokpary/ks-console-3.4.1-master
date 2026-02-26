import React, { useState, useEffect } from 'react';
import { get, groupBy } from 'lodash';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';

const Status = props => {
  const name = props.match.params.name;
  const namespace = props.match.params.namespace;

  return (
    <>
      <div>
        {/* 가상 머신 상세 관련 샘플 */}
        <DetailVmList
          type={t('RESOURCES_NETWORK')}
          match="sriov_network"
          name={name}
          project={namespace}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
