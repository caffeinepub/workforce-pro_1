import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type Map<K, V> = Map.Map<K, V>;
  type List<T> = List.List<T>;

  // Authorization / Storage Setup

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Type Definitions
  type EmployeeKey = Text;

  public type Employee = {
    id : EmployeeKey;
    userId : Principal;
    name : Text;
    employeeId : Text;
    department : Text;
    designation : Text;
    joiningDate : Text;
    salary : Float;
    phone : Text;
    email : Text;
    role : Text; // "Admin", "HR", or "Employee"
    branchId : Text;
    shiftId : Text;
    photo : ?Storage.ExternalBlob;
    isActive : Bool;
  };

  module Employee {
    public func compare(e1 : Employee, e2 : Employee) : Order.Order {
      Text.compare(e1.id, e2.id);
    };
  };

  public type AttendanceStatus = {
    #present;
    #absent;
    #late;
    #halfDay;
    #holiday;
  };

  public type AttendanceRecord = {
    id : Text;
    employeeId : Text;
    date : Text;
    checkInTime : ?Int;
    checkOutTime : ?Int;
    status : AttendanceStatus;
    overtimeMinutes : Nat;
    locationLat : ?Float;
    locationLng : ?Float;
    notes : Text;
  };

  module AttendanceRecord {
    public func compare(a1 : AttendanceRecord, a2 : AttendanceRecord) : Order.Order {
      Text.compare(a1.id, a2.id);
    };
  };

  public type LeaveType = { #sick; #casual; #paid; #unpaid };
  public type LeaveStatus = { #pending; #approved; #rejected };

  public type LeaveRequest = {
    id : Text;
    employeeId : Text;
    leaveType : LeaveType;
    startDate : Text;
    endDate : Text;
    days : Float;
    reason : Text;
    status : LeaveStatus;
    appliedAt : Int;
    reviewedBy : ?Text;
    reviewedAt : ?Int;
    reviewNote : ?Text;
  };

  module LeaveRequest {
    public func compare(l1 : LeaveRequest, l2 : LeaveRequest) : Order.Order {
      Text.compare(l1.id, l2.id);
    };
  };

  public type LeaveBalance = {
    employeeId : Text;
    sick : Float;
    casual : Float;
    paid : Float;
    unpaid : Float;
    year : Int;
  };

  module LeaveBalance {
    public func compare(l1 : LeaveBalance, l2 : LeaveBalance) : Order.Order {
      Text.compare(l1.employeeId, l2.employeeId);
    };
  };

  public type NotificationType = {
    #leaveApproved;
    #leaveRejected;
    #lateAlert;
    #general;
  };

  public type Notification = {
    id : Text;
    userId : Principal;
    title : Text;
    message : Text;
    notificationType : NotificationType;
    isRead : Bool;
    createdAt : Int;
    relatedId : ?Text;
  };

  module Notification {
    public func compare(n1 : Notification, n2 : Notification) : Order.Order {
      Text.compare(n1.id, n2.id);
    };
  };

  public type Shift = {
    id : Text;
    name : Text;
    startHour : Nat;
    startMinute : Nat;
    endHour : Nat;
    endMinute : Nat;
    gracePeriodMinutes : Nat;
    halfDayHours : Float;
  };

  module Shift {
    public func compare(s1 : Shift, s2 : Shift) : Order.Order {
      Text.compare(s1.id, s2.id);
    };
  };

  public type Branch = {
    id : Text;
    name : Text;
    location : Text;
    isActive : Bool;
  };

  module Branch {
    public func compare(b1 : Branch, b2 : Branch) : Order.Order {
      Text.compare(b1.id, b2.id);
    };
  };

  public type Holiday = {
    id : Text;
    name : Text;
    date : Text;
    holidayType : Text;
    isRecurring : Bool;
  };

  module Holiday {
    public func compare(h1 : Holiday, h2 : Holiday) : Order.Order {
      Text.compare(h1.id, h2.id);
    };
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  // Persistent state
  let employees = Map.empty<EmployeeKey, Employee>();
  let attendance = Map.empty<Text, AttendanceRecord>();
  let leaveRequests = Map.empty<Text, LeaveRequest>();
  let leaveBalances = Map.empty<Text, LeaveBalance>();
  let notifications = Map.empty<Text, Notification>();
  let shifts = Map.empty<Text, Shift>();
  let branches = Map.empty<Text, Branch>();
  let holidays = Map.empty<Text, Holiday>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper functions for authorization

  func getEmployeeByUserId(userId : Principal) : ?Employee {
    employees.values().find(func(emp) { emp.userId == userId });
  };

  func isAdminOrHR(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (getEmployeeByUserId(caller)) {
      case (?emp) { emp.role == "Admin" or emp.role == "HR" };
      case (null) { false };
    };
  };

  func isAdmin(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (getEmployeeByUserId(caller)) {
      case (?emp) { emp.role == "Admin" };
      case (null) { false };
    };
  };

  // User Profile Functions (required by frontend)

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Employee Functions

  public query ({ caller }) func getMyProfile() : async ?Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    getEmployeeByUserId(caller);
  };

  public shared ({ caller }) func createEmployee(employee : Employee) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can create employees");
    };

    if (employees.containsKey(employee.id)) { 
      Runtime.trap("Employee with this ID already exists.") 
    };
    employees.add(employee.id, employee);
  };

  public query ({ caller }) func getEmployee(id : EmployeeKey) : async Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access employee data");
    };

    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?employee) {
        // Allow access if admin/HR or viewing own profile
        let callerEmployee = getEmployeeByUserId(caller);
        if (not isAdminOrHR(caller)) {
          switch (callerEmployee) {
            case (?emp) {
              if (emp.id != id) {
                Runtime.trap("Unauthorized: Can only view your own employee record");
              };
            };
            case (null) {
              Runtime.trap("Unauthorized: Employee record not found for caller");
            };
          };
        };
        employee;
      };
    };
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access employee data");
    };
    employees.values().toArray().sort();
  };

  public shared ({ caller }) func updateEmployee(id : EmployeeKey, updates : Employee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update employee data");
    };

    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?existing) {
        // Admin/HR can update anyone, employees can only update themselves
        if (not isAdminOrHR(caller)) {
          let callerEmployee = getEmployeeByUserId(caller);
          switch (callerEmployee) {
            case (?emp) {
              if (emp.id != id) {
                Runtime.trap("Unauthorized: Can only update your own employee record");
              };
              // Employees cannot change their own role or salary
              if (updates.role != existing.role or updates.salary != existing.salary) {
                Runtime.trap("Unauthorized: Cannot modify role or salary");
              };
            };
            case (null) {
              Runtime.trap("Unauthorized: Employee record not found for caller");
            };
          };
        };
        employees.add(id, updates);
      };
    };
  };

  public shared ({ caller }) func deleteEmployee(id : EmployeeKey) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can delete employees");
    };
    if (not (employees.containsKey(id))) {
      Runtime.trap("Employee does not exist");
    };
    employees.remove(id);
  };

  public query ({ caller }) func searchEmployees(searchText : Text, searchBy : Text) : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search employees");
    };
    employees.values().filter(
      func(emp) {
        switch (searchBy) {
          case ("department") { emp.department.contains(#text searchText) };
          case ("branch") { emp.branchId.contains(#text searchText) };
          case ("role") { emp.role.contains(#text searchText) };
          case (_) { emp.name.contains(#text searchText) };
        };
      }
    ).toArray().sort();
  };

  // Attendance Functions

  public shared ({ caller }) func checkIn(
    locationLat : ?Float,
    locationLng : ?Float,
    notes : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in");
    };

    let callerEmployee = getEmployeeByUserId(caller);
    switch (callerEmployee) {
      case (null) { Runtime.trap("Employee record not found") };
      case (?emp) {
        let now = Time.now();
        let recordId = emp.employeeId # "-" # Int.abs(now).toText();
        let record : AttendanceRecord = {
          id = recordId;
          employeeId = emp.employeeId;
          date = "2026-01-01"; // Should use proper date formatting
          checkInTime = ?now;
          checkOutTime = null;
          status = #present;
          overtimeMinutes = 0;
          locationLat = locationLat;
          locationLng = locationLng;
          notes = notes;
        };
        attendance.add(recordId, record);
        recordId;
      };
    };
  };

  public shared ({ caller }) func checkOut(recordId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check out");
    };

    switch (attendance.get(recordId)) {
      case (null) { Runtime.trap("Attendance record not found") };
      case (?record) {
        let callerEmployee = getEmployeeByUserId(caller);
        switch (callerEmployee) {
          case (null) { Runtime.trap("Employee record not found") };
          case (?emp) {
            if (record.employeeId != emp.employeeId) {
              Runtime.trap("Unauthorized: Can only check out your own attendance");
            };
            let updated = {
              record with
              checkOutTime = ?Time.now();
            };
            attendance.add(recordId, updated);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyAttendance(month : Text) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access attendance");
    };

    let callerEmployee = getEmployeeByUserId(caller);
    switch (callerEmployee) {
      case (null) { Runtime.trap("Employee record not found") };
      case (?emp) {
        attendance.values().filter(
          func(record) {
            record.employeeId == emp.employeeId and record.date.contains(#text month);
          }
        ).toArray().sort();
      };
    };
  };

  public query ({ caller }) func getTeamAttendance(_date : Text) : async [AttendanceRecord] {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can view team attendance");
    };

    attendance.values().toArray().sort();
  };

  public shared ({ caller }) func markAbsent(_date : Text) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can mark absences");
    };

    // Implementation would mark all employees without attendance as absent
    // Simplified for this example
  };

  public query ({ caller }) func getTodayStats() : async {
    present : Nat;
    absent : Nat;
    late : Nat;
  } {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can view attendance stats");
    };

    let today = "2026-01-01"; // Should use proper date
    var present = 0;
    var absent = 0;
    var late = 0;

    for (record in attendance.values()) {
      if (record.date == today) {
        switch (record.status) {
          case (#present) { present += 1 };
          case (#absent) { absent += 1 };
          case (#late) { late += 1 };
          case (_) {};
        };
      };
    };

    { present; absent; late };
  };

  // Leave Functions

  public shared ({ caller }) func applyLeave(request : LeaveRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply for leave");
    };

    let callerEmployee = getEmployeeByUserId(caller);
    switch (callerEmployee) {
      case (null) { Runtime.trap("Employee record not found") };
      case (?emp) {
        if (request.employeeId != emp.employeeId) {
          Runtime.trap("Unauthorized: Can only apply leave for yourself");
        };
        leaveRequests.add(request.id, request);
        request.id;
      };
    };
  };

  public shared ({ caller }) func approveLeave(leaveId : Text, reviewNote : ?Text) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can approve leave");
    };

    switch (leaveRequests.get(leaveId)) {
      case (null) { Runtime.trap("Leave request not found") };
      case (?request) {
        let callerEmployee = getEmployeeByUserId(caller);
        let reviewerId = switch (callerEmployee) {
          case (?emp) { ?emp.employeeId };
          case (null) { null };
        };

        let updated = {
          request with
          status = #approved;
          reviewedBy = reviewerId;
          reviewedAt = ?Time.now();
          reviewNote = reviewNote;
        };
        leaveRequests.add(leaveId, updated);
      };
    };
  };

  public shared ({ caller }) func rejectLeave(leaveId : Text, reviewNote : ?Text) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can reject leave");
    };

    switch (leaveRequests.get(leaveId)) {
      case (null) { Runtime.trap("Leave request not found") };
      case (?request) {
        let callerEmployee = getEmployeeByUserId(caller);
        let reviewerId = switch (callerEmployee) {
          case (?emp) { ?emp.employeeId };
          case (null) { null };
        };

        let updated = {
          request with
          status = #rejected;
          reviewedBy = reviewerId;
          reviewedAt = ?Time.now();
          reviewNote = reviewNote;
        };
        leaveRequests.add(leaveId, updated);
      };
    };
  };

  public query ({ caller }) func getMyLeaves() : async [LeaveRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leave requests");
    };

    let callerEmployee = getEmployeeByUserId(caller);
    switch (callerEmployee) {
      case (null) { Runtime.trap("Employee record not found") };
      case (?emp) {
        leaveRequests.values().filter(
          func(request) { request.employeeId == emp.employeeId }
        ).toArray().sort();
      };
    };
  };

  public query ({ caller }) func getPendingLeaves() : async [LeaveRequest] {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can view pending leaves");
    };

    leaveRequests.values().filter(
      func(request) {
        switch (request.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }
    ).toArray().sort();
  };

  public query ({ caller }) func getLeaveBalance(employeeId : Text) : async ?LeaveBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leave balance");
    };

    let callerEmployee = getEmployeeByUserId(caller);
    switch (callerEmployee) {
      case (null) { Runtime.trap("Employee record not found") };
      case (?emp) {
        if (employeeId != emp.employeeId and not isAdminOrHR(caller)) {
          Runtime.trap("Unauthorized: Can only view your own leave balance");
        };
        leaveBalances.get(employeeId);
      };
    };
  };

  public shared ({ caller }) func initLeaveBalance(balance : LeaveBalance) : async () {
    if (not isAdminOrHR(caller)) {
      Runtime.trap("Unauthorized: Only admins or HR can initialize leave balance");
    };

    leaveBalances.add(balance.employeeId, balance);
  };

  // Notification Functions

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access notifications");
    };

    notifications.values().filter(
      func(notif) { notif.userId == caller }
    ).toArray().sort();
  };

  public shared ({ caller }) func markNotificationRead(notifId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };

    switch (notifications.get(notifId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notif) {
        if (notif.userId != caller) {
          Runtime.trap("Unauthorized: Can only mark your own notifications");
        };
        let updated = { notif with isRead = true };
        notifications.add(notifId, updated);
      };
    };
  };

  public shared ({ caller }) func markAllRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };

    for ((id, notif) in notifications.entries()) {
      if (notif.userId == caller and not notif.isRead) {
        let updated = { notif with isRead = true };
        notifications.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getUnreadCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access notifications");
    };

    var count = 0;
    for (notif in notifications.values()) {
      if (notif.userId == caller and not notif.isRead) {
        count += 1;
      };
    };
    count;
  };

  // Shift Functions

  public query ({ caller }) func getShifts() : async [Shift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access shifts");
    };
    shifts.values().toArray().sort();
  };

  public query ({ caller }) func getShift(id : Text) : async Shift {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access shifts");
    };

    switch (shifts.get(id)) {
      case (null) { Runtime.trap("Shift does not exist") };
      case (?shift) { shift };
    };
  };

  public shared ({ caller }) func updateShift(id : Text, shift : Shift) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update shifts");
    };
    if (shifts.get(id) == null) { Runtime.trap("Shift does not exist") };
    shifts.add(id, shift);
  };

  public shared ({ caller }) func addShift(shift : Shift) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add shifts");
    };
    if (shifts.containsKey(shift.id)) { 
      Runtime.trap("Shift with this ID already exists.") 
    };
    shifts.add(shift.id, shift);
  };

  // Branch Functions

  public query ({ caller }) func getBranches() : async [Branch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access branches");
    };
    branches.values().toArray().sort();
  };

  public query ({ caller }) func getBranch(id : Text) : async Branch {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access branches");
    };

    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch does not exist") };
      case (?branch) { branch };
    };
  };

  public shared ({ caller }) func createBranch(branch : Branch) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create branches");
    };
    if (branches.containsKey(branch.id)) { 
      Runtime.trap("Branch with this ID already exists.") 
    };
    branches.add(branch.id, branch);
  };

  public shared ({ caller }) func updateBranch(id : Text, branch : Branch) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update branches");
    };
    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch does not exist") };
      case (?_) { branches.add(id, branch) };
    };
  };

  // Holiday Functions

  public query ({ caller }) func getHolidays() : async [Holiday] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access holidays");
    };
    holidays.values().toArray().sort();
  };

  public query ({ caller }) func getHoliday(id : Text) : async Holiday {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access holidays");
    };

    switch (holidays.get(id)) {
      case (null) { Runtime.trap("Holiday does not exist") };
      case (?holiday) { holiday };
    };
  };

  public shared ({ caller }) func createHoliday(holiday : Holiday) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create holidays");
    };
    if (holidays.containsKey(holiday.id)) { 
      Runtime.trap("Holiday already exists.") 
    };
    holidays.add(holiday.id, holiday);
  };

  public shared ({ caller }) func deleteHoliday(id : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete holidays");
    };
    if (not (holidays.containsKey(id))) { 
      Runtime.trap("Holiday does not exist") 
    };
    holidays.remove(id);
  };

  // Dashboard Functions

  public query ({ caller }) func getDashboardStats() : async {
    totalEmployees : Nat;
    presentToday : Nat;
    absentToday : Nat;
    lateToday : Nat;
    pendingLeaves : Nat;
    totalWorkingHoursThisMonth : Float;
    avgWorkingHoursPerEmployee : Float;
  } {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let totalEmployees = employees.size();
    let today = "2026-01-01"; // Should use proper date
     
    var presentToday = 0;
    var absentToday = 0;
    var lateToday = 0;

    for (record in attendance.values()) {
      if (record.date == today) {
        switch (record.status) {
          case (#present) { presentToday += 1 };
          case (#absent) { absentToday += 1 };
          case (#late) { lateToday += 1 };
          case (_) {};
        };
      };
    };

    var pendingLeaves = 0;
    for (request in leaveRequests.values()) {
      switch (request.status) {
        case (#pending) { pendingLeaves += 1 };
        case (_) {};
      };
    };

    {
      totalEmployees;
      presentToday;
      absentToday;
      lateToday;
      pendingLeaves;
      totalWorkingHoursThisMonth = 0.0;
      avgWorkingHoursPerEmployee = 0.0;
    };
  };

  // Payroll Helper

  public query ({ caller }) func getPayrollSummary(
    employeeId : Text,
    month : Text,
    _year : Int
  ) : async {
    workingDays : Nat;
    daysPresent : Nat;
    overtimeHours : Float;
    salary : Float;
    estimatedEarnings : Float;
  } {
    if (not isAdminOrHR(caller)) {
      let callerEmployee = getEmployeeByUserId(caller);
      switch (callerEmployee) {
        case (null) { Runtime.trap("Employee record not found") };
        case (?emp) {
          if (emp.employeeId != employeeId) {
            Runtime.trap("Unauthorized: Can only view your own payroll summary");
          };
        };
      };
    };

    switch (employees.values().find(func(e) { e.employeeId == employeeId })) {
      case (null) { Runtime.trap("Employee not found") };
      case (?emp) {
        var daysPresent = 0;
        var totalOvertime = 0;

        for (record in attendance.values()) {
          if (record.employeeId == employeeId and record.date.contains(#text month)) {
            switch (record.status) {
              case (#present or #late) { daysPresent += 1 };
              case (_) {};
            };
            totalOvertime += record.overtimeMinutes;
          };
        };

        {
          workingDays = 22;
          daysPresent;
          overtimeHours = totalOvertime.toFloat() / 60.0;
          salary = emp.salary;
          estimatedEarnings = emp.salary;
        };
      };
    };
  };
};
