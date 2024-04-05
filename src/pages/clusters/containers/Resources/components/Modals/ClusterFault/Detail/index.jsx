import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import MarkdownIt from 'markdown-it'
import { ProjectSelect } from 'components/Inputs'
import { Form, Input, Select, TextArea, Button, Tooltip, Column, Columns, Radio, Checkbox } from '@kube-design/components'

import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'


const DetailModal = (props) => {
  const md = new MarkdownIt({ html: true })
  const detail = props.detail;
  const [modelView, setModalView] = useState(true);

  const closeModal = () => {
    setModalView(false);
  }

  return (
    <>
      <Modal
        icon="cluster"
        width={1000}
        title={props.title}
        visible={modelView}
        hideFooter
        onCancel={closeModal}
      >
        <Form>

          {/* 기본 정보 */}
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="auto" />
                    <col width="auto" />
                    <col width="auto" />
                    <col width="auto" />
                    <col width="auto" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th><strong>{t('RESOURCES_CLUSTER_FAULT_NAMESPACE')}</strong></th>
                      <th><strong>{t('RESOURCES_CLUSTER_FAULT_KIND')}</strong></th>
                      <th><strong>{t('RESOURCES_CLUSTER_FAULT_NAME')}</strong></th>
                      <th><strong>{t('RESOURCES_CLUSTER_FAULT_PROVIDER')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{detail.spec.name.split('/')[0]}</td>
                      <td>{detail.spec.kind}</td>
                      <td>{detail.spec.name.split('/')[1]}</td>
                      <td>{detail.metadata.labels["k8sgpts.k8sgpt.ai/name"]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Form.Item>

          {/* 에러 내용 */}
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="auto" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'unset' }}><strong>{t('RESOURCES_CLUSTER_FAULT_ERROR')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'unset' }}>
                        {detail.spec.error[0].text}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Form.Item>

          {/* 솔루션 */}
          <Form.Item>
            <div className={styles.wrapper} style={{ height: '500px' }}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="auto" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'unset' }}><strong>{t('RESOURCES_CLUSTER_FAULT_SOLUTION')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'unset', paddingLeft: '20px', height: '450px' }}>
                        <span dangerouslySetInnerHTML={{
                          __html: md.render(detail.spec.details)
                        }} />
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

