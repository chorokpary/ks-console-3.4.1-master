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
    </>
  );
};

export default inject('detailStore')(observer(Status));