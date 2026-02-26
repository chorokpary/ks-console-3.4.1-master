import React, { useState, useEffect } from 'react';
import { get, groupBy } from 'lodash';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'

const Status = props => {
  const { workspace, cluster, namespace } = props.match.params

  return (
    <>
      <div>
        {/* 가상 머신 상세 관련 샘플 */}
        <DetailVmList
          type={t('RESOURCES_NETWORK')}
          match="sriov_network"
          name={props.match.params.name}
          project={namespace}
          cluster={cluster}
          workspace={workspace}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
