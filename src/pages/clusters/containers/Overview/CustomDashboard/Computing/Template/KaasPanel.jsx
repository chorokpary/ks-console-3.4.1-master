import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Panel = ({ cluster, kaas }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-kaasimage"></i><Link to={`/clusters/${cluster}/containerImages`}>{t('RESOURCES_KAAS_IMAGE')}</Link></h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{kaas.used}</span> / {kaas.used + kaas.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{kaas.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{kaas.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel