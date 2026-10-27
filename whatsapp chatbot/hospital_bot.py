#########  hospital  WHATSAPP BOT 
import os, json, requests, logging
from flask import Flask, request, send_from_directory
from datetime import datetime
from collections import deque
from dotenv import load_dotenv
# AES Crypto
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

#########  LOGGING SETUP
logging.basicConfig(
    level=logging.DEBUG,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("chatbot.log")
    ]
)

# ########## FLASK INIT

load_dotenv()
app = Flask(__name__)

@app.route('/')
def home():
    # Assuming these paths are correct for your server setup
    return send_from_directory('/home/ngsolutions/htdocs/www.ngsolutions.tech', 'index.html')

@app.route('/privacy_policy.html')
def privacy():
    return send_from_directory('/home/ngsolutions/htdocs/www.ngsolutions.tech', 'privacy_policy.html')


#########  CONFIGURATION


WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "chatbot2025")
API_URL = os.getenv("API_URL", "")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
WHATSAPP_VERSION = os.getenv("WHATSAPP_VERSION", "v20.0")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "20"))


FLOW_ID = os.getenv("FLOW_ID", "")  # <-- ADD YOUR WHATSAPP FLOW ID HERE


#########  CRYPTO HELPERS

IV_16 = b"\x00" * 16

def _key32(k: str) -> bytes:
    b = k.encode()
    return b[:32] if len(b) >= 32 else b + b"\x00" * (32 - len(b))

def encrypt_hex(text: str) -> str:
    cipher = AES.new(_key32(ENCRYPTION_KEY), AES.MODE_CBC, iv=IV_16)
    return cipher.encrypt(pad(text.encode(), AES.block_size)).hex().upper()

def decrypt_hex(hex_str: str) -> str:
    try:
        cipher = AES.new(_key32(ENCRYPTION_KEY), AES.MODE_CBC, iv=IV_16)
        pt = unpad(cipher.decrypt(bytes.fromhex(hex_str)), AES.block_size)
        return pt.decode()
    except:
        logging.error("Decryption Error")
        return ""

############  WHATSAPP SENDER

def send_whatsapp_message(to: str, body):
    """Sends a message to the recipient. The body can be a string (text message) or a dict (interactive/flow)."""
    url = f"https://graph.facebook.com/{WHATSAPP_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
               "Content-Type": "application/json"}

    if isinstance(body, str):
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": body}
        }
    else:
        # If 'body' is a dictionary, assume it's the full interactive payload structure
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "recipient_type": "individual",
            "type": "interactive", # Explicitly set type for clarity
            "interactive": body['interactive'] # Extract the interactive part
        }

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=30)
        logging.info(f"[WA REQUEST] {json.dumps(payload)[:300]}")
        logging.info(f"[WA RESPONSE] {r.status_code} {r.text[:300]}")
        return r.status_code == 200
    except Exception as e:
        logging.error(f"[WA ERROR] {e}")
        return False


# ===================================================================================
################### functions -----------

def get_error(line:str):
    return(
        f"*error this line {line}*\n"
    )

# 1
def Welcome_to_language_selection():
    return {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text":""" Welcome and language selection * """},
            "action": {
                "buttons": [ 
                    {"type": "reply", "reply": {"id": "english", "title": "English"}},
                    {"type": "reply", "reply": {"id": "marathi", "title": "Marathi"}},
                    {"type": "reply", "reply": {"id": "kannada", "title": "Kannada"}},
                    
                ]
            }
        }
    }

#2 
def sencond_to_help():
    return {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text":"""How may I help you today?* 
            """},
            "action": {
                "buttons": [ 
                    # == only three buttons and 20 words 
                    {"type": "reply", "reply": {"id": "book_appointment", "title": "Book an appointment"}},
                    {"type": "reply", "reply": {"id": "check_queue_no", "title": "Check Queue No."}},
                    {"type": "reply", "reply": {"id": "talk_to_staff", "title": "Talk to staff"}},
                   
                ]
            }
        }
    }

# 3
def get_form_menu(lang="en"):
    """Returns the structure for the interactive message containing the Flow button."""
    return {
        "interactive": {
            "type": "flow",
            "header": {
                "type": "text",
                "text": "Patient Appointment SCHEDULE"
            },
            "body": { 
                "text": "Click Here to Enter Cargo Details." 
            },
            "action": {
                "name": "flow",
                "parameters": {
                    "flow_message_version": "3",
                    "flow_id": FLOW_ID,
                    "flow_cta": "CLICK HERE",
                    "flow_action": "navigate",
                    "flow_action_payload": {
                        "screen": "RECOMMEND"  
                    }
                }
            }
        }
    }
# 4

def confirmation_details(details):
    return {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": details},
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "confirm",
                            "title": "Confirm Appointment"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "cancel",
                            "title": "Cancel Appointment"
                        }
                    }
                ]
            }
        }
    }


# request api
def save_patient_to_api(name, age, contact, department, date, time_slot):
    url = "https://hospital-patient-management-server.vercel.app/api/patients"

    payload = {
        "name": name,
        "age": age,
        "contact": contact,
        "Department": department,
        "Date": date,
        "time_slot": time_slot,
        "jsonwebtoken_whatsapp_chatbot": "hospital_chatbot_vinayak" 
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=20
        )

        logging.info(
            "Patient API response: %s %s",
            response.status_code,
            response.text[:1000]
        )

        response.raise_for_status()

        try:
            return True, response.json()
        except ValueError:
            return True, {"message": response.text}

    except requests.RequestException as e:
        logging.exception("Failed to save patient to API")
        return False, {"error": str(e)}

# 5
def appointment_confirm_summary(patient_id,appointment_number,virtual_queue):
    return {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": (
                    "Your appointment has been booked successfully!\n\n"
                    f"Patient ID: {patient_id}\n"
                    f"Appointment number: {appointment_number}\n"
                    f"Your virtual queue number: {virtual_queue}\n"
                    "Please arrive on time."
                    "Thank you. "  
                    "Please contact the hospital for information."                    
                )
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "english",
                            "title": "Main Menu"
                                }
                            }
                        ]
                    }
                }
            }


# request api
def check_patient_appointment_today_api(from_no):
    url = (
        "https://hospital-patient-management-server.vercel.app"
        "/api/patients/getPatient_todays_appointment"
    )

    payload = {"number": from_no , "jsonwebtoken_whatsapp_chatbot": "hospital_chatbot_vinayak"}

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=20
        )

        logging.info(
            "Today's appointment API: %s %s",
            response.status_code,
            response.text[:1000]
        )

        response.raise_for_status()

        result = response.json()

        if not isinstance(result, dict):
            logging.error("Unexpected API response format: %s", result)
            return False, {
                "error": "Unexpected API response format"
            }

        return True, result

    except requests.RequestException as e:
        logging.exception("Failed to fetch today's appointment")
        return False, {"error": str(e)}

    except ValueError:
        logging.error("Appointment API returned invalid JSON")
        return False, {"error": "Invalid JSON response"}

    
#6 
def appointment_no_check(from_no):
    success, result = check_patient_appointment_today_api(from_no)

    # Validate API request
    if not success or not isinstance(result, dict):
        logging.error("Appointment lookup failed: %s", result)
        return (
            "Sorry, we could not check your appointment right now. "
            "Please try again later."
        )

    # Extract patient and queue information
    patient_id = result.get("_id")
    appointment_number = result.get("appointment_number")
    virtual_queue = result.get("your_virtual_queue_number")
    current_queue = result.get("current_queue_number")

    # Validate patient ID
    if not patient_id:
        logging.warning("No patient ID in API response: %s", result)
        return (
            "No appointment record was found for today, "
            "or the API did not return a patient ID. "
            "Please contact hospital reception."
        )

    # Safe fallbacks for optional fields
    appointment_number = appointment_number or patient_id

    if virtual_queue is None:
        virtual_queue = "Not available"

    if current_queue is None:
        current_queue = "Not available"

    logging.info(
        "Appointment found: patient_id=%s, appointment_number=%s",
        patient_id,
        appointment_number
    )

    # Return interactive WhatsApp message
    return {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": (
                    "*Your Appointment Details*\n\n"
                    f"*Patient ID:* {patient_id}\n"
                    f"*Appointment Number:* {appointment_number}\n"
                    f"*Current Queue Number:* {current_queue}\n"
                    f"*Your Virtual Queue Number:* {virtual_queue}\n\n"
                    "Please arrive on time. Thank you."
                )
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "english",
                            "title": "Main Menu"
                        }
                    }
                ]
            }
        }
    }


###########################################################
#  USER STATE HANDLING
###########################################################

user_state = {}
PROCESSED = set()
recent_ids = deque(maxlen=1000)

def dedup(mid):
    """Prevents reprocessing duplicate webhook events."""
    if mid in PROCESSED:
        return True
    PROCESSED.add(mid)
    recent_ids.append(mid)
    if len(PROCESSED) > 1000:
        # Simple garbage collection for the set
        PROCESSED.clear()
        PROCESSED.update(recent_ids)
    return False

###########################################################
#  WEBHOOK HANDLER
###########################################################

@app.get("/health")
def health():
    return "ok", 200

@app.route("/webhook", methods=["GET","POST"])
def webhook():
    
    # VERIFY WEBHOOK
    if request.method == "GET":
        if (request.args.get("hub.mode") == "subscribe" and
            request.args.get("hub.verify_token") == VERIFY_TOKEN):
            return request.args.get("hub.challenge"), 200
        return "Verification failed", 403
    
    # ===== RECEIVE MESSAGE =====
    data = request.get_json(silent=True) or {}
    logging.debug(str(data)[:900])

    msgs = (((data.get("entry") or [{}])[0].get("changes") or [{}])[0]
            .get("value", {}).get("messages", []))

    if not msgs:
        return "", 200

    msg = msgs[0]
    msg_id = msg.get("id")
    if dedup(msg_id):
        return "", 200

    from_no = msg.get("from")
    msg_type = msg.get("type")
    
    # Initialize user state if it doesn't exist
    user = user_state.setdefault(from_no, {"step": "main", "lang": "en"})
    step = user.get("step", "main")
    lang = user.get("lang", "en")
    
    #===== INPUT PARSE / Extract user input ===
    if msg_type == "text":
        text = msg["text"]["body"].strip().lower()
    elif msg_type == "interactive":
        inter = msg.get("interactive", {})
        if inter.get("type") == "button_reply":
            text = inter["button_reply"]["id"]
        elif inter.get("type") == "list_reply":
            text = inter["list_reply"]["id"]
        else:
            text = ""
    else:
        # Handles other types of messages (media, etc.)
        text = ""

    # FIX WAS HERE: Use the 'step' variable we defined, not a non-existent user["main"]
    # step = user["main"] # <-- ORIGINAL BUGGY LINE
    logging.info(f"From: {from_no} | Step: {step} | Input: {text}")
    logging.debug(f"STEP={step}, LANG={lang}, SELECTED={text}")


    # ===== GREETING / RESET =====
    greetings = [
        "hi", "hello", "hey", "start", "menu",
        "hola", "good morning", "good evening"
    ]

    if text in greetings:
        user_state[from_no] = {"step": "main", "lang": "en"}
        send_whatsapp_message(
            from_no, Welcome_to_language_selection()
        )
        return "", 200

    # ===== STEP 1: LANGUAGE SELECTION =====
    if step == "main":
        if text in ("english", "marathi", "kannada"):
            user["lang"] = text
            user["step"] = "english"
            send_whatsapp_message(from_no, sencond_to_help())
        else:
            send_whatsapp_message(
                from_no, Welcome_to_language_selection()
            )
        return "", 200

    # ===== STEP 2: HELP MENU =====
    if step == "english":
        # Main Menu button clicked
        if text == "english":
            user["step"] = "english"
            send_whatsapp_message(from_no, sencond_to_help())
            return "", 200

        elif text == "book_appointment":
            user["step"] = "book_appointment"
            send_whatsapp_message(from_no, get_form_menu())
            return "", 200

        elif text == "check_queue_no":
            response = appointment_no_check(from_no)
            send_whatsapp_message(from_no, response)
            return "", 200

        elif text == "talk_to_staff":
            send_whatsapp_message(
                from_no,
                "Hospital staff will assist you. Please contact reception."
            )
            return "", 200

        return "", 200


    # ===== STEP 3: RECEIVE WHATSAPP FLOW RESPONSE =====
    interactive = msg.get("interactive", {})

    if (
        msg_type == "interactive"
        and interactive.get("type") == "nfm_reply"
    ):
        try:
            form_data_str = interactive["nfm_reply"]["response_json"]
            form_data = json.loads(form_data_str)

            fullname = form_data.get(
                "screen_0_Full_Name_0", "Not provided"
            )
            age = form_data.get(
                "screen_0_Age_1", "Not provided"
            )
            contactno = form_data.get(
                "screen_0_Contact_No_2", "Not provided"
            )

            department_options = {
                "0_ENT_(Ear,_Nose_&_Throat)":
                    "ENT (Ear, Nose & Throat)",
                "1_Dental": "Dental",
                "2_Cardiology": "Cardiology",
                "3_Pulmonology_(Chest_&_Respiratory)":
                    "Pulmonology (Chest & Respiratory)",
                "4_General_Physician_/_OPD":
                    "General Physician / OPD",
                "5_Dermatology_(Skin)": "Dermatology (Skin)"
            }

            time_options = {
                "0_Morning__11:00_AM_–_11:30_AM":
                    "11:00 AM - 11:30 AM",
                "1_Morning__11:30_AM_-_12:00_PM":
                    "11:30 AM - 12:00 PM",
                "2_Morning__12:30_PM_-_01:00_PM":
                    "12:30 PM - 01:00 PM",
                "3_Morning__01:30_PM_-_2:00_PM":
                    "01:30 PM - 02:00 PM",
                "4_Evening_05:00_PM_–_05:30_PM":
                    "05:00 PM - 05:30 PM",
                "5_Evening_05:30_PM_-_06:00_PM":
                    "05:30 PM - 06:00 PM",
                "6_Evening_06:30_PM_PM_-_07:00_PM":
                    "06:30 PM - 07:00 PM",
                "7_Evening_07:30_PM_-_8:00_PM":
                    "07:30 PM - 08:00 PM"
            }

            department_id = form_data.get(
                "screen_0_Department__3", "Not provided"
            )
            time_id = form_data.get(
                "screen_0_Time__5", "Not provided"
            )
            appointment_date = form_data.get(
                "screen_0_Date__4", "Not provided"
            )

            department = department_options.get(
                department_id, department_id
            )
            appointment_time = time_options.get(
                time_id, time_id
            )

            # Save form details until confirmation/cancellation
            user["appointment"] = {
                "fullname": fullname,
                "age": age,
                "contactno": contactno,
                "department": department,
                "date": appointment_date,
                "time": appointment_time
            }

            details = (
                "*Please check your appointment details:*\n\n"
                f"*Patient Name:* {fullname}\n"
                f"*Age:* {age}\n"
                f"*Contact No:* {contactno}\n"
                f"*Department:* {department}\n"
                f"*Date:* {appointment_date}\n"
                f"*Time:* {appointment_time}\n\n"
                "Click confirm for booking else click cancel"
            )

            user["step"] = "confirmation"
            send_whatsapp_message(
                from_no, confirmation_details(details)
            )

        except (KeyError, ValueError, TypeError) as e:
            logging.exception("Unable to process WhatsApp Flow response")
            send_whatsapp_message(
                from_no,
                "Sorry, we could not process your form. "
                "Please try booking again."
            )

        return "", 200


    # ===== STEP 4: CONFIRM OR CANCEL =====
    if step == "confirmation":

        if text.strip().lower() in ("confirm", "confirm_details"):

            appointment = user.get("appointment")

            if not appointment:
                send_whatsapp_message(
                    from_no,
                    "Appointment details not found. Please book again."
                )
                user["step"] = "english"
                return "", 200

            # Validate required appointment details
            required_fields = [
                "fullname",
                "age",
                "contactno",
                "department",
                "date",
                "time"
            ]

            missing_fields = [
                field for field in required_fields
                if not appointment.get(field)
                or str(appointment.get(field)).strip() == ""
            ]

            if missing_fields:
                logging.warning(
                    "Missing appointment fields: %s", missing_fields
                )
                send_whatsapp_message(
                    from_no,
                    "Some appointment details are missing. "
                    "Please submit the form again."
                )
                user["step"] = "english"
                user.pop("appointment", None)
                return "", 200

            # Save the patient only after confirmation
            success, result = save_patient_to_api(
                name=appointment["fullname"],
                age=appointment["age"],
                contact=appointment["contactno"],
                department=appointment["department"],
                date=appointment["date"],
                time_slot=appointment["time"]
            )

            # Validate API request success
            if not success or not isinstance(result, dict):
                logging.error("Patient API request failed: %s", result)

                send_whatsapp_message(
                    from_no,
                    "Sorry, we could not book your appointment. "
                    "Please try again later."
                )
                return "", 200

            # Validate the fields returned by the API
            patient_id = result.get("_id")
            appointment_number = result.get("appointment_number")
            virtual_queue = result.get("your_virtual_queue_number")
            current_queue = result.get("current_queue_number")

            if not patient_id:
                logging.error(
                    "API response missing patient _id: %s", result
                )
                send_whatsapp_message(
                    from_no,
                    "Your request was processed, but we could not "
                    "retrieve the patient ID. Please contact reception."
                )
                return "", 200

            # Use fallbacks if queue fields are absent
            appointment_number = appointment_number or patient_id
            virtual_queue = (
                virtual_queue if virtual_queue is not None else "Not available"
            )
            current_queue = (
                current_queue if current_queue is not None else "Not available"
            )

            logging.info("Patient saved successfully: %s", result)

            send_whatsapp_message(
                from_no,
                appointment_confirm_summary(patient_id,appointment_number,virtual_queue)
            )

            user["step"] = "english"
            user.pop("appointment", None)
            return "", 200

        elif text.strip().lower() in ("cancel", "cancel_details"):

            user.pop("appointment", None)
            user["step"] = "english"

            send_whatsapp_message(
                from_no,
                "Your appointment request has been cancelled."
            )
            return "", 200

        return "", 200

    return "", 200

