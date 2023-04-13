export default function Card({ title, description, readOnly }) {
    return (
        <div className="w-full md:w-1/2 xl:w-1/3 px-4">
            <div className="bg-white rounded-lg overflow-hidden mb-10">
                <img
                    src="https://cdn.tailgrids.com/1.0/assets/images/cards/card-01/image-02.jpg"
                    alt="image"
                    className="w-full"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                    <h3>
                        <span
                            className="
                                font-semibold
                                text-dark text-xl
                                sm:text-[22px]
                                md:text-xl
                                lg:text-[22px]
                                xl:text-xl
                                2xl:text-[22px]
                                mb-4
                                block
                                hover:text-primary
                            "
                        >
                            {title}
                        </span>
                    </h3>
                    <p className="text-base text-body-color leading-relaxed mb-7">
                        {description}
                    </p>
                    {
                        !readOnly && (
                            <button
                                href="javascript:void(0)"
                                className="
                                inline-block
                                py-2
                                px-7
                                border border-[#E5E7EB]
                                rounded-full
                                text-base text-body-color
                                font-medium
                                hover:border-primary hover:bg-primary hover:text-white
                                transition"
                            >
                                Přihlásit se
                            </button>
                        )
                    }

                </div>
            </div>
        </div>
    )
}