/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
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
