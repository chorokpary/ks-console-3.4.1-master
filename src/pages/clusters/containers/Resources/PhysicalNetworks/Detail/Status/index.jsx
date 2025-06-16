import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';

const Status = props => {
  const store = props.detailStore;
  const cluster = props.detailStore?.detail.cluster;
  
  useEffect(() => {
    const networkId = props.match.params.id;
  }, []);

  return (
    <>
      <div>
        {/* 가상 머신 상세 관련 샘플 */}
        <DetailVmList
          type={t('RESOURCES_NETWORK')}
          variables="networks"
          {...props.match.params}
          id={props.match.params.id}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
