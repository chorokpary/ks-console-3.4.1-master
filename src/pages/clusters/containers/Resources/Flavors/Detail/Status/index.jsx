import React from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const Status = (props) => {

  return (
    <>  
       {/* 가상 머신 상세 관련 샘플 */}
      <DetailVmList type='이미지' variables='image' name="ubuntu-2004-image-amd64" />
      
    </>
  );
};

export default inject('detailStore')(observer(Status))

