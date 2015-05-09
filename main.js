$(document).ready(function() {
    var fieldData = {};

    var renderAssignment = function(assignment, i, aid) {
        var id = aid||(assignment.name + "" + i);

        return '<div class="input-group">'
        +   '<span class="input-group-addon">'+assignment.name+'</span>'
        +   '<input type="number" step="any" min="0" class="form-control" id="'+id+'" value="'+(assignment.default||"")+'">'
        +   '<span class="input-group-addon">/'+assignment.max+'</span>'
        + '</div>'
    }

    var renderFields = function(data) {
        var output = "<h1>" + (data.class||"Grades") + "</h1>";

        var counter = 0;

        fieldData.curData = data;
        fieldData.assignments = {};

        for(var key in data.categories) {
            fieldData.assignments[key] = [];
        }

        data.assignments.forEach(function(assignment) {
            fieldData.assignments[assignment.category].push(assignment);
        });

        for(key in data.categories) {
            if(fieldData.assignments[key].length === 0)
                continue;
            output += "<section><h4>"+key+"</h4>";
            fieldData.assignments[key].forEach(function(assignment) {
                output += renderAssignment(assignment, counter++);
            });
            output += "</section>"
        }

        output += "<section><h4>Fixed Assignment</h4>";
        output += renderAssignment(data.fixedAssignment, null, "fixed");
        output += renderAssignment({name: "Target Grade", max: "100", default: 90}, null, "targetgrade");
        output += "</section>";

        output += "<div class='text-center buttongroup'><button id='calc1' class='btn btn-primary'>Calculate Score Needed</button><button id='calc2' class='btn btn-default'>Calculate Score From Score</button></div>";

        $("#calculator-container").html(output);

        $("#calc1").click(function() { calculate(1); });
        $("#calc2").click(function() { calculate(2); });
    }

    var calculate = function(mode) {
        var type = fieldData.curData.scoreType;
        var percent = 0;
        var fixedPercent = fieldData.curData.categories[fieldData.curData.fixedAssignment.category];
        var counter = 0;

        for(key in fieldData.curData.categories) {
            if(fieldData.assignments[key].length === 0)
                continue;

            scores = [0,0];
            fieldData.assignments[key].forEach(function(assignment) {
                score = parseFloat($("#" + assignment.name + counter++).val());
                scores[0] += type === "raw" ? score : score/assignment.max;
                scores[1] += type === "raw" ? assignment.max : 1;

            });

            percent += fieldData.curData.categories[key]*(scores[0]/scores[1]);
        }

        if(mode === 1)
            $("#fixed").val(fieldData.curData.fixedAssignment.max*((parseFloat($("#targetgrade").val()) - percent)/fixedPercent));
        else
            $("#targetgrade").val(percent + (fixedPercent*$("#fixed").val()/100));
    }

    $("#render").click(function() {
        try {
            renderFields(JSON.parse($("#inputdata").val()));
        } catch(err) {
            alert("JSON not valid. Error: " + err);
        }
    })
})