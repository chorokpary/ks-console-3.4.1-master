import React, { useState, useRef, useEffect } from 'react'

import { Form } from '@kube-design/components'
import LicenseStore from 'stores/resources/licenses'
import { Modal } from 'components/Base'
import styles from './index.scss';

const store = new LicenseStore()

const FingerprintModal = (props) => {

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const closeModal = () => {
        setModalView(false);
    }

    return (
        <>
            <Modal
                icon="pen"
                width={700}
                title={props.title}
                onOk={closeModal}
                onCancel={closeModal}
                visible={modelView}
                isSubmitting={props.store.isSubmitting}
            >
                <Form data={formData} ref={form}>
                    <div className={styles.fingerprint}>{props.store.fingerprint.fingerprint.value}</div>
                </Form>
            </Modal>

        </>
    );
};

export default FingerprintModal

