import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';

const Status = props => {
  return (
    <>
      <div>
        <DetailVmList
          type={t('RESOURCES_NETWORK_STORAGE')}
          match="network_storage"
          name={props.match.params.name}
          project={props.match.params.namespace}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));