import React, { useState } from 'react';

const Langs = require('../langs.json')

function FlagsContainer({ handleSelectLang, selectedLang }) {
    const [hidden, setHidden] = useState(true)

    const handleLangClick = (lang) => {
        handleSelectLang(lang)
        setHidden(true)
    }

    return (
        <div className='flags-container'>
            <div className='dropdown-langs justify-center' onClick={() => setHidden(!hidden)}>
                <div className='selected-lang'>
                    {selectedLang.flag && <img
                        src={selectedLang.flag}
                        width="30"
                        alt={selectedLang.name}
                    />}
                    <div>
                        {selectedLang.name}
                    </div>
                </div>
            </div>
            <div className='langs-options'>
                {Object.entries(Langs).map((value, key) => {
                    const lang = value[1]
                    return (
                        <div className={`${hidden ? 'hidden' : 'visible'}`}
                                value=""
                                key={key}
                                onClick={() => handleLangClick(lang)}
                        >
                            <div>
                                <img
                                    src={lang.flag}
                                    width="30"
                                    alt={lang.name}
                                />
                                <div>
                                    {lang.name}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

}

export default FlagsContainer;