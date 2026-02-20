import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Panel = ({ cluster, md }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-mediatedvgpu"></i><Link to={`/clusters/${cluster}/mediateddevices`}>{t('RESOURCES_MEDIATED_DEVICE')}</Link></h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{md.used}</span> / {md.used + md.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{md.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{md.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel