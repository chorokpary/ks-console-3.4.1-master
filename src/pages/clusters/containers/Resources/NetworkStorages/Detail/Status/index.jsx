import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';

const Status = props => {
  const store = props.detailStore;
  const cluster = props.detailStore?.detail.cluster;

  useEffect(() => {
  }, []);

  return (
    <>
      <div>
        <DetailVmList
          type={t('RESOURCES_NETWORK_STORAGE')}
          variables="network_storage"
          {...props.match.params}
          name={props.match.params.name}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));