import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Panel = ({ cluster, router }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-router"></i><Link to={`/clusters/${cluster}/routers`}>{t('RESOURCES_VROUTER')}</Link></h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{router.internal + router.external}</span></p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{router.internal}</div>
                            <p className="status internal"><span>{t('RESOURCES_INTERNAL')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{router.external}</div>
                            <p className="status external"><span>{t('RESOURCES_EXTERNAL')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel