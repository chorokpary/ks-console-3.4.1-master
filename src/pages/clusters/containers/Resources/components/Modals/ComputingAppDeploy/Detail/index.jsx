import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { ProjectSelect } from 'components/Inputs'
import { Form, Input, Select, TextArea, Button, Tooltip, Column, Columns, Radio, Checkbox } from '@kube-design/components'

import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'


const DetailModal = (props) => {

  const explanation = props.explanation;
  const [modelView, setModalView] = useState(true);

  const closeModal = () => {
    setModalView(false);
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        height={700}
        title={props.title}
        visible={modelView}
        hideFooter
        onCancel={closeModal}
      >
        <Form>
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="auto" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'unset', whiteSpace: 'pre-wrap' }}>
                        {explanation}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default DetailModal

