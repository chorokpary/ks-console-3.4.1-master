import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Panel = ({ cluster, lb }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-loadbalancer"></i><Link to={`/clusters/${cluster}/loadBalancers`}>{t('RESOURCES_LOAD_BALANCER')}</Link></h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{lb.used}</span> / {lb.used + lb.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{lb.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{lb.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel