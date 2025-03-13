from flask import Flask, session, render_template, request, redirect, url_for
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
import time
import x
import uuid

from icecream import ic
ic.configureOutput(prefix=f'----- | ', includeContext=True)

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)





##############################
@app.after_request
def disable_cache(response):
    """
    This function automatically disables caching for all responses.
    It is applied after every request to the server.
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


##############################
@app.get("/send-email")
def send_email():
    try:
        x.send_email()
        return "email"
    except Exception as ex:
        ic(ex)
        return "error"


##############################
@app.get("/")
def show_index():
    try:
        is_session = False
        if session.get("user"): is_session = True

        active_index = "active"

        # return render_template("index.html", is_session = is_session, active_index=active_index)
    
        q = "CALL get_users()"

        db, cursor = x.db()
        q = """SELECT u.user_pk, u.user_name, GROUP_CONCAT(p.user_phone ORDER BY p.user_phone) AS phones FROM users u LEFT JOIN users_phones p ON u.user_pk = p.user_fk GROUP BY u.user_pk"""
        cursor.execute(q)
        rows = cursor.fetchall()
        ic(rows)
        for row in rows:
            if row["phones"]:
                row["user_phones"] = row["phones"].split(",")
            else:
                row["user_phones"] = []
        ic(rows)
        return render_template("index.html", title="Home", rows=rows, is_session = is_session, active_index=active_index)

    except Exception as ex:
        ic(ex)
        return "System under maintenance", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()
    




##############################
@app.get("/contact-us")
def show_contact_us():
    active_contact_us = "active"
    return render_template("contact-us.html", title="Contact us", active_contact_us=active_contact_us)

##############################
@app.get("/about-us")
def show_about_us():
    active_about_us = "active"
    return render_template("about-us.html", title="About us", active_about_us=active_about_us)

##############################
@app.get("/profile")
def profile():
    try:
        is_session = False
        if session["user"]: is_session = True  
        active_profile = "active"      
        return render_template("profile.html", title="Profile", user=session["user"], is_session=is_session, active_profile=active_profile)
        # user_name = session["user"]["user_name"]
        # user_last_name = session["user"]["user_last_name"]
        # return render_template("profile.html", title="Profile", user_name=user_name, user_last_name=user_last_name)
    except Exception as ex:
        ic(ex)
        return redirect(url_for("show_login"))
    finally:
        pass







##############################
@app.get("/api/v1/items")
def get_items():
    try:
        db, cursor = x.db()
        q = "SELECT * FROM users"
        cursor.execute(q)
        rows = cursor.fetchall()
        ic(rows)
        return rows
    except Exception as ex:
        return ex, 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()  



##############################
@app.delete("/api/v1/users/<user_id>")
def delete_user(user_id):
    try:
        db, cursor = x.db()
        q = "DELETE FROM users WHERE user_pk = %s"
        cursor.execute(q, (user_id,))
        if cursor.rowcount != 1:
            raise Exception("user not found")
        db.commit()
        return f"User {user_id} deleted"
    except Exception as ex:
        return ex, 400
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()  



##############################
def ___USER___(): pass

##############################
@app.get("/login")
def show_login():
    active_login = "active"
    message = request.args.get("message", "")
    return render_template("login.html", title="Login us", active_login=active_login, message=message)

##############################
@app.get("/signup")
def show_signup():
    active_signup ="active"
    error_message = request.args.get("error_message", "")
    return render_template("signup.html", 
                           title="Signup us", 
                           active_signup=active_signup, 
                           error_message=error_message,
                           old_values={})


##############################
@app.post("/login")
def login():
    try:
        # MUST VALIDATE
        user_email = x.validate_user_email()
        user_password = x.validate_user_password()
        db, cursor = x.db()
        q = "SELECT * FROM users WHERE user_email = %s"
        cursor.execute(q, (user_email,))
        user = cursor.fetchone()
        if not user: raise Exception("User not found")
        if not check_password_hash(user["user_password"], user_password):
            raise Exception("Invalid credentials")
        
        if user["user_verified_at"] == 0:
            raise Exception("Please Verify your email before loggin in!")

        # todo: remove the user's password
        user.pop("user_password")
        ic(user)
        session["user"] = user
        return redirect(url_for("profile"))
    except Exception as ex:
        ic(ex)
        old_values = request.form.to_dict()

        if "user_ema" in str(ex):
            old_values.pop("user_username", None)
            return render_template("signup.html",                                   
                error_message="Invalid username", old_values=old_values, user_username_error="input_error")
        if "first name" in str(ex):
            old_values.pop("user_name", None)
            return render_template("signup.html",
                error_message="Invalid name", old_values=old_values, user_name_error="input_error")
        return str(ex), 400 
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()  


##############################
@app.get("/logout")
def logout():
    session.pop("user")
    return redirect(url_for("show_login"))


##############################
@app.post("/signup")
def signup():
    try:
        user_username = x.validate_user_username()
        user_name = x.validate_user_name()
        user_last_name = x.validate_user_last_name()
        user_email = x.validate_user_email()
        user_password = x.validate_user_password()
        hashed_password = generate_password_hash(user_password)
        user_verified_at = int(time.time());

        user_verification_key = str(uuid.uuid4())

        # ic(hashed_password)
        user_created_at = int(time.time())

        q = """INSERT INTO users 
        (user_pk, user_username, user_name, user_last_name, user_email, 
        user_password,user_verification_key, user_created_at, user_updated_at, user_deleted_at) 
        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        db, cursor = x.db()
        cursor.execute(q, (user_username, user_name,user_last_name,user_email,hashed_password, user_verification_key,user_created_at,0,0))
       
        if cursor.rowcount != 1: raise Exception("System under maintenance")

        db.commit()
        x.send_email(user_name, user_last_name, user_verification_key)
        return redirect(url_for("show_login", message="Signup ok"))
    except Exception as ex:
        ic(ex)
        if "db" in locals(): db.rollback()
        # request.form is a tuple
        # test = request.form
        old_values = request.form.to_dict()
        if "username" in str(ex):
            old_values.pop("user_username", None)
            return render_template("signup.html",                                   
                error_message="Invalid username", old_values=old_values, user_username_error="input_error")
        if "first name" in str(ex):
            old_values.pop("user_name", None)
            return render_template("signup.html",
                error_message="Invalid name", old_values=old_values, user_name_error="input_error")
        if "last name" in str(ex):
            old_values.pop("user_last_name", None)
            return render_template("signup.html",
                error_message="Invalid last name", old_values=old_values, user_last_name_error="input_error")
        if "Invalid email" in str(ex):
            old_values.pop("user_email", None)
            return render_template("signup.html",
                error_message="Invalid email", old_values=old_values, user_email_error="input_error")
        if "password" in str(ex):
            old_values.pop("user_password", None)
            return render_template("signup.html",
                error_message="Invalid password", old_values=old_values, user_password_error="input_error")

        if "user_email" in str(ex):
            return redirect(url_for("show_signup",
                error_message="Email already exists", old_values=old_values, email_error=True))
        if "user_username" in str(ex): 
            return redirect(url_for("show_signup", 
                error_message="Username already exists", old_values=request.form, user_username_error=True))
        return redirect(url_for("show_signup", error_message=ex.args[0]))
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

##############################
@app.get("/verify/<verification_key>")
def verify_user(verification_key):
    try:

        db, cursor = x.db()

        q = "SELECT * FROM users WHERE user_verification_key = %s"

        cursor.execute(q ,(verification_key,)) 
        user = cursor.fetchone()

        if not user:
            return "Invalid verification key or user not found", 400
        
        if user.get("user_verified_at", 0) > 0:
            return "Account already verified", 200
        
        current_time = int(time.time())
        q = "UPDATE users SET user_verified_at = %s WHERE user_verification_key = %s"
        cursor.execute(q, (current_time, verification_key))

        db.commit()
        return "Account succefully Verified"

        
    except Exception as ex:
        ic(ex)
        if "db" in locals(): db.rollback()
        return f"Verification failed: {str(ex)}", 400
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

# ##############################
# @app.post("/signup")
# def signup():
#     try:
#         user_username = x.validate_user_username()
#         user_name = x.validate_user_name()
#         user_last_name = x.validate_user_last_name()
#         user_email = x.validate_user_email()
#         user_password = x.validate_user_password()
#         hashed_password = generate_password_hash(user_password)
#         # ic(hashed_password)
#         user_created_at = int(time.time())

#         q = """INSERT INTO users 
#         (user_pk, user_username, user_name, user_last_name, user_email, 
#         user_password, user_created_at, user_updated_at, user_deleted_at) 
#         VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s)"""

#         db, cursor = x.db()
#         cursor.execute(q, (user_username, user_name,user_last_name,user_email,hashed_password,user_created_at,0,0))
       
#         if cursor.rowcount != 1: raise Exception("System under maintenance")

#         db.commit()
#         x.send_email(user_name, user_last_name)
#         return redirect(url_for("show_login", message="Signup ok"))
#     except Exception as ex:
#         ic(ex)
#         if "db" in locals(): db.rollback()
#         if "user_email" in str(ex): return redirect(url_for("show_signup", error_message="Email already exists"))
#         if "user_username" in str(ex): return redirect(url_for("show_signup", error_message="Username already exists"))
#         return redirect(url_for("show_signup", error_message=ex.args[0]))
#     finally:
#         if "cursor" in locals(): cursor.close()
#         if "db" in locals(): db.close()











