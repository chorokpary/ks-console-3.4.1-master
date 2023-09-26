import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

import styles from './index.scss'

const Status = (props) => {
    const store = props.detailStore;
    useEffect(() => {

    }, []);

    return (
        <>
            <div>
                {/* 가상 머신 상세 관련 샘플 */}
                <DetailVmList type='보안그룹' variables='security_groups' name={props.match.params.name} />
            </div>
        </>
    );
};

export default inject('detailStore')(observer(Status))

