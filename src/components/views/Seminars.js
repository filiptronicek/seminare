'use client';

import { useEffect, useState } from 'react';
import supabase from 'src/lib/supabase-browser';

export default function SeminarsList() {

    const [seminars, setSeminars] = useState(null);
    useEffect(() => {
        (async () => {

            let { data: seminars, error } = await supabase
                .from('seminars')
                .select('display_name')

            setSeminars(seminars);
            console.log(seminars);
        })()

    }, []);

    return (
        <ul>
            {seminars && seminars.map((seminar) => (
                <li key={seminar.id}>{seminar.display_name}</li>
            ))}
        </ul>
    );
}
