import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Panel = ({ cluster, network }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-network"></i><Link to={`/clusters/${cluster}/networks`}>{t('RESOURCES_NETWORK')}</Link></h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{network.internal + network.external}</span></p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{network.internal}</div>
                            <p className="status internal"><span>{t('RESOURCES_INTERNAL')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{network.external}</div>
                            <p className="status external"><span>{t('RESOURCES_EXTERNAL')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel