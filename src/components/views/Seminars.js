'use client';

import { useEffect, useState } from 'react';
import supabase from 'src/lib/supabase-browser';
import Card from '../Card';

export default function SeminarsList() {

    const [seminars, setSeminars] = useState(null);
    useEffect(() => {
        (async () => {

            let { data: seminars, error } = await supabase
                .from('seminars')
                .select('*');

            setSeminars(seminars);
        })()

    }, []);

    return (
        <ul className='list-decimal flex flex-row'>
            {seminars && seminars.map((seminar) => (
                <Card title={seminar.display_name} description={seminar.description}></Card>
            ))}
        </ul>
    );
}
