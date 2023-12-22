import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Modal } from 'components/Base'
import TopologyItem from './Item'

import classnames from 'classnames'
import styles from './index.scss'

const TopologyModal = (props) => {

  const [modelView, setModalView] = useState(true);

  const closeModal = () => {
    setModalView(false);
  }


  return (
    <>
       <Modal
        title={t('전체 네트워크 토폴리지')}
        bodyClassName={classnames({
          [styles.readOnly]: true,
        })}
        onCancel={closeModal}
        visible={modelView}
        closable={true}
        hideFooter={true}
        fullScreen
      >
        <TopologyItem closeModal={() => closeModal()}/>
      </Modal>
    </>
  );
};

export default TopologyModal

