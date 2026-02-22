import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

const Panel = ({ cluster, keypair }) => {
    const history = useHistory();

    return (
        <>
            <div className="box type_status" onClick={() => history.push(`/clusters/${cluster}/keypairs`)} style={{ cursor: 'pointer' }}>
                <h5><i className="ico-type24-keypair"></i>{t('RESOURCES_KEYPAIR')}</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{keypair.used}</span> / {keypair.used + keypair.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{keypair.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{keypair.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel