from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.auth.views import login, logout,password_change, password_reset
from channels import views
from registration.backends.default.views import RegistrationView
from channels.forms import RegForm
from channels.views import ActView

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'tv.views.home', name='home'),
    # url(r'^tv/', include('tv.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$',views.index,name='index'),
    url(r'^channels/', include('channels.urls')),
    #url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root' : '/Users/Nuradil/tv/media/'}),
    url(r'^captcha/', include('captcha.urls'),name='captcha'),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^registration/$',RegistrationView.as_view(form_class=RegForm),name='registration_register'),
    url(r'^activate/(?P<activation_key>\w+)/$',ActView.as_view(),name='registration_activate'),
    url(r'^news/',include('news.urls',namespace='news')),
    )