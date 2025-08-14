/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const Status = (props) => {
    const store = props.detailStore;
    const detail = toJS(store.detail);

    const renderVms = () => {
        return (
            <>
                <div>
                    {/* 가상 머신 상세 관련 샘플 */}
                    <DetailVmList type={t('RESOURCES_HOST_DEVICE')} match='host_device' name={detail.host_device.name} gpu={store.detail.host_device.is_gpu} />
                </div>
            </>
        );
    }

    return (
        <>
            {renderVms()}
        </>
    )
};

export default inject('detailStore')(observer(Status))

