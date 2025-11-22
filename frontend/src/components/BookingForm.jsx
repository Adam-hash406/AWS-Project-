import uuid
import boto3
import urllib.request
import json
from datetime import datetime
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('AccommodationRequests')

BASE_LOOKUP = {
    "RAF Brize Norton": "OX183LX",
    "RAF Lossiemouth": "IV316SD",
    "Catterick Garrison": "DL93PQ",
    "HMNB Portsmouth": "PO13LT",
    "RAF Marham": "PE339NP"
}

OS_API_KEY = "Zyvg0Sjk3UjuZ42sEPXeL9kg85T9VGhI"  # ideally store in env vars

def _json_response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }

def lambda_handler(event, context):
    path = event.get("path", "")
    query = event.get("queryStringParameters") or {}

    try:
        # --- Base Info Route ---
        if path.endswith("/base-info"):
            base_name = query.get("base", "")
            postcode = BASE_LOOKUP.get(base_name)
            if not postcode:
                return _json_response(404, {"error": "Base not found"})

            url = f"https://api.postcodes.io/postcodes/{postcode}"
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())

            if not data.get("result"):
                return _json_response(500, {"error": "Postcode lookup failed"})

            area_info = data["result"]
            lat = area_info.get("latitude")
            lng = area_info.get("longitude")

            map_urls = [
                f"https://api.os.uk/maps/raster/v1/wmts?service=WMTS&request=GetMap&version=1.0.0&layer=Light&style=default&format=image/png&tilematrixset=EPSG:3857&center={lng},{lat}&zoom={zoom}&key={OS_API_KEY}"
                for zoom in [12, 13, 14, 15, 16]
            ]

            return _json_response(200, {
                "base": base_name,
                "postcode": postcode,
                "area_info": {
                    "region": area_info.get("region"),
                    "district": area_info.get("admin_district"),
                    "country": area_info.get("country")
                },
                "lat": lat,
                "lng": lng,
                "map_urls": map_urls
            })

        # --- Booking Route ---
        try:
            data = json.loads(event.get("body", "{}"))
        except (json.JSONDecodeError, TypeError):
            return _json_response(400, {"error": "Invalid request body"})

        required_fields = ["serviceNumber", "courseTitle", "startDate"]
        missing = [f for f in required_fields if f not in data]

        if missing:
            return _json_response(400, {"error": f"Missing fields: {', '.join(missing)}"})

        existing = table.scan(
            FilterExpression=(
                Attr("serviceNumber").eq(data["serviceNumber"]) &
                Attr("courseTitle").eq(data["courseTitle"]) &
                Attr("startDate").eq(data["startDate"])
            )
        )

        if existing["Count"] > 0:
            return _json_response(409, {"error": "Duplicate booking detected"})

        item = {
            "bookingId": str(uuid.uuid4()),
            "rank": data.get("rank", ""),
            "surname": data.get("surname", ""),
            "forename": data.get("forename", ""),
            "serviceNumber": data["serviceNumber"],
            "email": data.get("email", ""),
            "courseTitle": data["courseTitle"],
            "startDate": data["startDate"],
            "endDate": data.get("endDate", ""),
            "cicNumber": data.get("cicNumber", ""),
            "timestamp": datetime.utcnow().isoformat()
        }

        table.put_item(Item=item)
        return _json_response(200, {"message": "Booking stored successfully!"})

    except Exception as e:
        print("Error:", str(e))
        return _json_response(500, {"error": str(e)})
