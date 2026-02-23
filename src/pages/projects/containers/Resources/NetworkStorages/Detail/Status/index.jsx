import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';

const Status = props => {
  const store = props.detailStore;
  const { workspace, cluster, namespace } = props.match.params;

  useEffect(() => {
  }, []);

  return (
    <>
      <div>
        <DetailVmList
          type={t('RESOURCES_NETWORK_STORAGE')}
          match='network_storage'
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