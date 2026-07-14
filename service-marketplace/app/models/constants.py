"""
Lagos districts supported for provider location filtering.
This list covers all major Local Government Areas (LGAs) in Lagos State.
Stored as a plain VARCHAR for flexibility — filtered via case-insensitive LIKE
or exact match in the search endpoint.
"""

LAGOS_DISTRICTS = [
    # Lagos Island / Eko
    "Lagos Island", "Lagos Mainland", "Eti-Osa", "Ikoyi", "Victoria Island",
    "Lekki", "Ajah", "Badagry",
    # Mainland — North/West
    "Ikeja", "Surulere", "Mushin", "Oshodi-Isolo", "Agege",
    "Alimosho", "Ifako-Ijaiye", "Shomolu", "Kosofe", "Somolu",
    # Mainland — North/East
    "Ikorodu", "Epe", "Ibeju-Lekki",
]
