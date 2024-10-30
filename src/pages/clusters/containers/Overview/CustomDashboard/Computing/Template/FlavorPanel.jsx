import React, { useEffect, useState } from 'react'

const Panel = ({ flavor }) => {

    return (
        <>
            <div className="box type_status">
                <h5><i className="ico-type24-flavor"></i>Flavor</h5>
                <div className="cont_group">
                    <div className="cont1">
                        <div className="number_wrap">
                            <p><span className="em">{flavor.used}</span> / {flavor.used + flavor.unused}</p>
                        </div>
                    </div>
                    <div className="cont2">
                        <div className="status_wrap">
                            <div className="value">{flavor.used}</div>
                            <p className="status used"><span>{t('RESOURCES_USED')}</span></p>
                        </div>
                        <div className="status_wrap">
                            <div className="value">{flavor.unused}</div>
                            <p className="status unused"><span>{t('RESOURCES_UNUSED')}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel