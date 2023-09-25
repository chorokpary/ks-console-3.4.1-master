import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  const [showSecret, setShowSecret] = useState(false);

  const [encodeKey, setEncodeKey] = useState();
  const [originData, setOriginData] = useState();

  const createEncode64 = (key) => {
    let forge = require('node-forge');
    const encoded = forge.util.encode64(key);
    return encoded;
  }

  const convert = () => {
    return showSecret ? originData : encodeKey
  }

  const textClipboard = () => {
    const keyText = showSecret ? originData : encodeKey;
    navigator.clipboard.writeText(keyText);
    Notify.success('복사 되었습니다.');
  }

  // 초기 데이터 처리
  useEffect(() => {
    setOriginData(get(store.detail.keypair, 'public_key', ''));
    setEncodeKey(createEncode64(get(store.detail.keypair, 'public_key', '')));
  }, [])

  const renderOperations = () =>{
    return (
      <div>
        <Button
          type="flat"
          icon={showSecret ? 'eye' : 'eye-closed'}
          onClick={() => {setShowSecret(!showSecret)}}
        />
        <Button onClick={() => textClipboard()}>복사</Button>
      </div>
    )
  }

  return (
    <>  
        <div>
         <Card operations={renderOperations()}>
          <div className={styles.defaultWrapper}>
              <ul>
                  <li>
                    <span>
                      <pre>{convert()}</pre>
                    </span>
                  </li>
              </ul>
            </div>
         </Card>
      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Status))

