from __future__ import division
from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin
from bson import ObjectId
import hashlib
import datetime

app = Flask(__name__)
CORS(app, resources={r"/auth/*": {"origins": "*"}}, expose_headers='Authorization')

app.config['MONGO_DBNAME'] = 'zebra'
app.config['MONGO_URI'] = 'mongodb+srv://root:qwerty1234@zebra-0d9rq.mongodb.net/zebra'

mongo = PyMongo(app)

#-----user-sign-in-------
@app.route('/auth/sign_in', methods=['POST'])
@cross_origin()
def user_sign_in():
    email = request.json['email']
    password = request.json['password']
    print email
    user = mongo.db.users
    hash_password = hashlib.md5(password).hexdigest()
    details = user.find_one({"email":email,"password":hash_password})
    if details:
        current_token = details['token']
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        token_string = email + password + now
        token = hashlib.md5(token_string).hexdigest()
        new_token ={'token':token}
        user.update_one({'token':current_token},{"$set":new_token},upsert=False)
        return jsonify({'result' : {'status': 'success','data':token}})
    else:
        return jsonify({'result' :{'status': 'error'}})
    return jsonify({'result' :{'status': 'error'}})
#---------------------------

#-------get-user-details---------
@app.route('/auth/user_details', methods=['POST'])
@cross_origin()
def get_user_details():
    token = request.json['token']
    user = mongo.db.users
    details = user.find_one({"token":token})
    if details:
        first_name = details['first_name']
        last_name = details['last_name']
        return jsonify({'result' : {'status': 'success','first_name':first_name,'last_name':last_name}})
    else:
        return jsonify({'result' :{'status': 'error'}})
    return jsonify({'result' :{'status': 'error'}})
#---------------------------

#-------create new project---------
@app.route('/new_project', methods=['POST'])
@cross_origin()
def create_new_project():
    creater_token = request.json['token']
    project_name = request.json['project_name']
    doc_content = request.json['doc_content']
    user = mongo.db.users
    project = mongo.db.projects
    project_members=mongo.db.project_members
    details = user.find_one({"token":creater_token})
    if details:
        user_id = details['_id']
        last_update = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        project_id = project.insert({'project_name': project_name, 'creator': user_id, 'members':user_id, 'doc_content': doc_content,'last_update':last_update, 'last_update_by':user_id})
        if project_id:
            project_id_string = str(project_id)
            project_member_init = project_members.insert({'project_id': project_id, 'user_id': user_id})
            return jsonify({'result' : {'status': 'success','data':project_id_string}})
        else:
            return jsonify({'result' :{'status': 'error'}})
    else:
        return jsonify({'result' :{'status': 'error'}})
    return jsonify({'result' :{'status': 'error'}})
#---------------------------

#------get project details/ doc details------
@app.route('/fetch_doc', methods=['POST'])
@cross_origin()
def fetch_doc():
    token = request.json['token']
    project_id_string = request.json['project_id']
    project_id = ObjectId(project_id_string)
    user = mongo.db.users
    user_details = user.find_one({"token":token})
    projects = mongo.db.projects
    project_members = mongo.db.project_members
    tasks = mongo.db.tasks
    a =[]
    m = []
    if(user_details):
        project = projects.find_one({"_id":project_id})
        if(project):
            members = project_members.find({"project_id": project_id})
            if(members):
                for member in members:
                    member_details=user.find_one({"_id":member['user_id']})
                    if(member_details):
                        m_temp = {}
                        member_name = member_details['first_name']+" "+member_details['last_name']
                        m_temp['name'] = member_name
                        m_temp['id'] = str(member_details['_id'])
                        m.append(m_temp)
            project_depth = {'project_name': project['project_name'], 'creator': str(project['creator']), 'members':m, 'doc_content':project['doc_content'],'last_update':project['last_update'], 'last_update_by':str(project['last_update_by'])}
            cursor = tasks.find({"project_id": project_id})
            if(cursor):
                for task in cursor:
                    data = {'task_id':str(task['_id']),'task_name':task['task_name'],'description':task['description'],'project_id':str(task['project_id']),'start_date':task['start_date'],'end_date':task['end_date'],'task_status':task['status']}
                    a.append(data)
            else:
                a.append("No tasks till now")
            project_details ={'project_details':project_depth}
            project_tasks = {'tasks':a}
            data = project_details.copy()
            data.update(project_tasks)
            return jsonify({'result' : {'status': 'success','data':data}})
    else:
        return jsonify({'result' :{'status': 'No1'}})
    return jsonify({'result' :{'status': 'No2'}})
#------------------------

#saving a tasks
@app.route('/save_task',methods = ['POST'])
@cross_origin()
def save_task():
  project_id_string = request.json['project_id']
  project_id = ObjectId(project_id_string)
  status = request.json['status']
  token = request.json['token']
  task_id_string = request.json['task_id']
  task_id = ObjectId(task_id_string)
  user = mongo.db.users
  user_exists = user.find_one({'token' : token })
  if (user_exists):
    task = mongo.db.tasks
    task_exists = task.find_one({"_id":task_id})
    print "task exists"
    if(task_exists):
      task.update_one({'_id':task_id},{"$set":{"status" : status}},upsert=False )
      return jsonify({'result' : {'status':'success'}})
  return jsonify({'result' : {'status':'error'}})


#-------save project---------
@app.route('/save_project', methods=['POST'])
@cross_origin()
def save_project():
    token = request.json['token']
    project_id_string = request.json['project_id']
    project_id = ObjectId(project_id_string)
    doc_content = request.json['doc_content']
    user = mongo.db.users
    project = mongo.db.projects
    details = user.find_one({"token":token})
    if details:
        user_id = details['_id']
        user_name = details['first_name'] + " " + details['last_name']
        last_update = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        project_record = project.find_one({"_id":project_id})
        if project_record:
            project.update_one({'_id':project_id},{"$set":{"doc_content":doc_content,"last_update_by":user_id,"last_update":last_update}},upsert=False)
            last_updates = {'last_update_by':user_name, 'last_update':last_update}
            return jsonify({'result' : {'status': 'success', 'data':last_updates }})
        else:
            return jsonify({'result' :{'status': 'error'}})
    else:
        return jsonify({'result' :{'status': 'error'}})
    return jsonify({'result' :{'status': 'error'}})
#---------------------------

#------get user calendar tasks------
@app.route('/get_user_calendar_tasks', methods=['POST'])
def get_user_calendar_tasks():
    token = request.json['token']
    user = mongo.db.users
    user_details = user.find_one({"token":token})
    tasks = mongo.db.tasks
    a =[]
    if user_details:
        user_id= user_details['_id']
        cursor = tasks.find({"user_id": user_id})
        if(cursor):
            for task in cursor:
                data = {'task_id':str(task['_id']),'task_name':task['task_name'],'description':task['description'],'project_id':task['project_id'],'start_date':task['start_date'],'end_date':task['end_date'],'task_status':task['status']}
                a.append(data)

            return jsonify({'result' : {'status': 'success','data':a}})
        else:
            return jsonify({'result' :{'status': 'No'}})
    else:
        return jsonify({'result' :{'status': 'No1'}})
    return jsonify({'result' :{'status': 'No2'}})
#------------------------

#------user dashboard-----------------------
@app.route('/user_dashboard', methods=['POST'])
@cross_origin()
def get_user_dashboard():
    token = request.json['token']
    user = mongo.db.users
    user_details = user.find_one({"token":token})
    tasks = mongo.db.tasks
    project_members =mongo.db.project_members
    projects = mongo.db.projects
    a =[]
    b= []
    if user_details:
        user_id= user_details['_id']

        tasks_cursor = tasks.find({"user_id": user_id})
        user_tasks = dict()
        user_projects_cursor = project_members.find({"user_id": user_id})
        if(tasks_cursor):
            for task in tasks_cursor:
                user_task = {'task_id':str(task['_id']),'task_name':task['task_name'],'description':task['description'],'project_id':str(task['project_id']),'start_date':task['start_date'],'end_date':task['end_date'],'task_status':task['status']}

                a.append(user_task)
            user_tasks = {'tasks':a}
            '''return jsonify({'result' : {'status': 'success','data':a}})'''
        else:

            user_tasks = {'tasks':{}}

        if(user_projects_cursor):
            for user_project in user_projects_cursor:
                task_progress=0
                project_id = user_project['project_id']

                project = projects.find_one({"_id":project_id})
                if(project):
                    count=0;

                    project_tasks=tasks.find({"project_id": project_id})
                    if(project_tasks):
                        completed_tasks=0
                        total_tasks=0
                        for task in project_tasks:
                            if((task['status'])== 2):
                                completed_tasks=completed_tasks+1
                            total_tasks=total_tasks+1
                        if(total_tasks>0):
                            print(completed_tasks)
                            print(total_tasks)
                            task_progress = (completed_tasks/total_tasks)*100
                            task_progress = int(task_progress)
                        else:
                            task_progress =0
                    else:
                        task_progress =0
                    owner = project['creator']
                    owner_details=user.find_one({"_id":owner})
                    owner_name =owner_details['first_name']+" "+owner_details['last_name']
                    members = project_members.find({"project_id": project_id})
                    if(members):
                        for member in members:
                            '''member_details=user.find_one({"_id":member['user_id']})'''
                            count= count+1;
                        #count = count;
                    else:
                        count = 1;
                    b.append({'project_id':str(project['_id']),'project_name':project['project_name'], 'owner':owner_name,'members':count, 'task_progress':task_progress})
            user_projects = {'projects':b}
        else:
            user_projects = {'projects':'No projects assigned'}
        data = user_projects.copy()
        data.update(user_tasks)   # start with x's keys and values

        return jsonify({'result' : {'status': 'success','data':data}})
    else:
        return jsonify({'result' :{'status': 'No1'}})
    return jsonify({'result' :{'status': 'No2'}})
#------------------------------------------------------
# sign up new user
@app.route('/auth/sign_up', methods=['POST'])
@cross_origin()
def create_user():
  user = mongo.db.users
  print request
  email = request.json['email']
  firstName = request.json['firstname']
  lastName = request.json['lastname']
  password = request.json['password']
  profilePic = request.json['profilepic']
  hash_password = hashlib.md5(password).hexdigest()
  now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
  user_exists = user.find_one({'email' : email,'password': hash_password })
  token_string = email + password+ now
  token = hashlib.md5(token_string).hexdigest()
  if(user_exists):
      current_token = user_exists['token']
      now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
      token_string = email + password + now
      token = hashlib.md5(token_string).hexdigest()
      new_token ={'token':token}
      user.update_one({'token':current_token},{"$set":new_token},upsert=False)
      return jsonify({'result' : {'status': 'success','data':token}})
  else:
      new_user = user.insert({'email': email, 'first_name': firstName,'last_name':lastName,'password':hash_password,'token':token,'profilePic':profilePic})
      return jsonify({'result' : {'status':'success','data':token}})

#sign out
@app.route('/auth/sign_out', methods=['POST'])
@cross_origin()
def sign_out():
  user = mongo.db.users
  tokens = request.json['token']
  new_token = {'token' : ""}
  delete_token = user.find_one({'token' : tokens})
  print delete_token
  if(delete_token):
      user.update_one({'token': tokens}, {"$set": new_token}, upsert=False)
  return jsonify({'result' : {'status':'success'}})

#invite
@app.route('/invite', methods=['POST'])
@cross_origin()
def invite_member():
  project_id = request.json['project_id']
  project_id = ObjectId(project_id)
  email_id = request.json['email_id']
  token_id = request.json['token']
  user = mongo.db.users
  user_exists = user.find_one({'token' : token_id })
  if(user_exists):
        project = mongo.db.projects
        print project_id
        project_exists = project.find_one({'_id': project_id })
        print project_exists
        if(project_exists):
            member_toadd = user.find_one({'email' : email_id })
            if(member_toadd):
                member_toadd_id = member_toadd['_id']
                print member_toadd_id
                firstName = member_toadd['first_name']
                lastName = member_toadd['last_name']
                project_member = mongo.db.project_members
                member_exists = project_member.find_one({'user_id' : member_toadd_id,'project_id':project_id})
                if(member_exists):
                    return jsonify({'result' : {'status':'error_member_existing'}})
                else:
                    new_proj_member = project_member.insert({'project_id':project_id,'user_id':member_toadd_id})
                return jsonify({'result' : {'status':'success','data':{'user_id': str(member_toadd_id),'firstName': firstName,'lastName': lastName}}})
            else:
                return jsonify({'result' : {'status':'error_no_member'}})
        return jsonify({'result' : {'status':'error_no_proj'}})
  return jsonify({'result' : {'status':'error_no_user'}})





#update project
@app.route('/update_project', methods = ['POST'])
@cross_origin()
def update_project():
    user = mongo.db.users
    token = request.json['token']
    project_id = request.json['project_id']
    name = request.json['name']
    project_id = ObjectId(project_id)
    user_exists = user.find_one({'token' : token })
    if(user_exists):
        project = mongo.db.projects
        project_to_update = project.find_one({'_id' : project_id })
        if(project_to_update):
            project.update_one({'_id': project_id}, {"$set": {'project_name': name }}, upsert=False)
            return jsonify({'result' : {'status':'success'}})
        return jsonify({'result' : {'status':'error'}})
    return jsonify({'result' : {'status':'error'}})


# creating task
@app.route('/create_task', methods = ['POST'])
@cross_origin()
def create_task():
  project_id = request.json['project_id']
  project_id = ObjectId(project_id)
  task_name = request.json['task_name']
  description = request.json['description']
  start_date = datetime.datetime.now().strftime('%m-%d-%Y')
  end_date = request.json['end_date']
  print task_name
  print project_id
  print description
  print end_date
  status = 0;
  token = request.json['token']
  user = mongo.db.users
  user_exists = user.find_one({'token' : token })
  if(user_exists):
      user_id = user_exists['_id']
      task = mongo.db.tasks
      new_task = task.insert({'project_id': project_id,'user_id':user_id,'task_name': task_name,'description': description,'start_date':start_date,'end_date': end_date,'status':status})
      return jsonify({'result' : {'status':'success'}})
  return jsonify({'result' : {'status':'error'}})

#deleting task
@app.route('/delete_task', methods = ['POST'])
def delete_task():
    user = mongo.db.users
    token = request.json['token']
    task_id = request.json['task_id']
    task_id = ObjectId(task_id)
    user_exists = user.find_one({'token' : token })
    if(user_exists):
        task = mongo.db.tasks
        task_to_delete = task.find_one({'_id' : task_id })
        if(task_to_delete):
            task.remove({'_id':task_id})
            return jsonify({'result' : {'status':'success'}})
        else:
                return jsonify({'result' : {'status':'error'}})
    return jsonify({'result' : {'status':'error'}})

#notifications
@app.route('/notifications', methods = ['POST'])
def user_notification():
    user = mongo.db.users
    token = request.json['token']
    user_exists = user.find_one({'token' : token })
    if(user_exists):
        user_id = user_exists['_id']
        task = mongo.db.tasks
        task_exists = task.find_one({'user_id' : user_id })
        if(task_exists):
            end_date = task_exists['end_date']
            now = datetime.datetime.now().strftime('%m-%d-%Y %H:%M:%S')
            print now
            end_date = datetime.datetime.strptime(end_date, "%m-%d-%Y")
            now = datetime.datetime.strptime(now, "%m-%d-%Y %H:%M:%S")
            diff = abs((now - end_date).days)
            if(diff <=5):
                return jsonify({'result' : {'status':'success','data':{'task_name': task_exists['task_name'],'description': task_exists['description'],'start_date': task_exists['start_date'],'end_date': task_exists['end_date'],'priority': task_exists['priority'],'status':task_exists['status']}}})
        return jsonify({'result' : {'status':'error'}})
    return jsonify({'result' : {'status':'error'}})

#send mail
@app.route('/send_mail', methods = ['POST'])
def send_mail():
    fromaddr = "sahanacs66@gmail.com"
    toaddr = "sahanacs66@gmail.com"
    msg = MIMEMultipart()
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = "Python email"
    body = "Python test mail"
    msg.attach(MIMEText(body, 'plain'))
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    #NEED password of user
    server.login("from address", "your account password")
    text = msg.as_string()
    server.sendmail(fromaddr, toaddr, text)
    return jsonify({'result' : {'status':'success'}})


if __name__ == '__main__':
    app.run(debug=True)
    #app.run(host='0.0.0.0')