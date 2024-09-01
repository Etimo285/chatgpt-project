import React, { useState } from 'react';

const Langs = require('../langs.json')

function FlagsContainer() {
    const [hidden, setHidden] = useState(true)
    const [selectedLang, setSelectedLang] = useState({flag: null, label: "Select a langage"})

    const handleLangSelection = (lang) => {
        setSelectedLang({flag: lang.flag, label: lang.name})
        setHidden(true)
    }

    return (
        <div className='flags-container'>
            <div className='dropdown-langs justify-center' onClick={() => setHidden(!hidden)}>
                <div className='selected-lang'>
                    {selectedLang.flag && <img
                        src={selectedLang.flag}
                        width="30"
                        alt={selectedLang.label}
                    />}
                    <div>
                        {selectedLang.label}
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
                                onClick={() => handleLangSelection(lang)}
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