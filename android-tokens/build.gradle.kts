import org.gradle.api.publish.maven.MavenPublication

plugins {
    id("com.android.library")
    id("maven-publish")
}

group = providers.gradleProperty("tokenGroup").orElse("com.example.design").get()
version = providers.gradleProperty("tokenVersion").orElse("0.3.0-SNAPSHOT").get()

android {
    namespace = "com.example.design.tokens"
    compileSdk = 35

    defaultConfig {
        minSdk = 23
    }

    sourceSets.getByName("main").res.srcDir(rootProject.file("dist/android/res"))

    publishing {
        singleVariant("release")
    }
}

val verifyGeneratedTokens by tasks.registering {
    val colors = rootProject.file("dist/android/res/values/colors.xml")
    val dimens = rootProject.file("dist/android/res/values/dimens.xml")
    doLast {
        check(colors.isFile && dimens.isFile) {
            "Generate Android resources first with npm ci && npm run build"
        }
    }
}

tasks.named("preBuild") {
    dependsOn(verifyGeneratedTokens)
}

publishing {
    publications {
        register<MavenPublication>("release") {
            groupId = project.group.toString()
            artifactId = "tokens-android"
            version = project.version.toString()
            afterEvaluate {
                from(components["release"])
            }
        }
    }
}
