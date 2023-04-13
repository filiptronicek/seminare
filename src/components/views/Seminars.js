'use client';

import { useEffect, useState } from 'react';
import supabase from 'src/lib/supabase-browser';

export default function SeminarsList() {

    const [seminars, setSeminars] = useState(null);
    useEffect(() => {
        (async () => {

            let { data: seminars, error } = await supabase
                .from('seminars')
                .select('*')

            setSeminars(seminars);
        })()

    }, []);

    return (
        <ul className='list-decimal'>
            {seminars && seminars.map((seminar) => (
                <li key={seminar.id}>{seminar.display_name} ({seminar.teacher})</li>
            ))}
        </ul>
    );
}
