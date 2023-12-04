import React, { useEffect, useState } from 'react'

const Panel = ({ floatingIp }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-floatingip"></i>{t('RESOURCES_FLOATING_IP')}</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{floatingIp.used}</span> / {floatingIp.used + floatingIp.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{floatingIp.used}</div>
                            <p className="status used"><span>Used</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{floatingIp.unused}</div>
                            <p className="status unused"><span>Unused</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel